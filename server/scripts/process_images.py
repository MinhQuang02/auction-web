import os
import io
import time
import requests
import psycopg2
import subprocess
from psycopg2.extras import DictCursor
from dotenv import load_dotenv

def remove(input_data_bytes):
    try:
        # Use local file to avoid temp path permissions/formatting issues
        unique_id = str(int(time.time() * 1000))
        tmp_in_path = os.path.abspath(f"temp_in_{unique_id}.png")
        tmp_out_path = os.path.abspath(f"temp_out_{unique_id}.png")

        with open(tmp_in_path, "wb") as f:
            f.write(input_data_bytes)

        # Call Node script
        script_path = os.path.join(os.path.dirname(__file__), "remove_bg.js")
        
        result = subprocess.run(
            ["node", script_path, tmp_in_path, tmp_out_path], 
            capture_output=True, 
            text=True
        )

        if result.returncode != 0 or "SUCCESS" not in result.stdout:
            # print(f"⚠️  Node BG removal failed: {result.stderr}") # Reduce noise
            # Log error log?
            pass
            return None

        # Read output
        if os.path.exists(tmp_out_path):
            with open(tmp_out_path, "rb") as f:
                output_data = f.read()
        else:
            return None

        # Cleanup
        if os.path.exists(tmp_in_path): os.remove(tmp_in_path)
        if os.path.exists(tmp_out_path): os.remove(tmp_out_path)

        return output_data

    except Exception as e:
        print(f"❌ Error in Node bridge: {e}")
        return None

from supabase import create_client, Client
from tqdm import tqdm
from PIL import Image

# 1. Load Environment Variables
# ------------------------------------------------------------------------------
# Try to load from ../.env first
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
print(f"Loading env from: {env_path}")
load_dotenv(env_path)

# Fallback/Override from local .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Try multiple common names for the key
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("STORAGE_KEY") or os.getenv("SUPABASE_ANON_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"DEBUG: Found SUPABASE_URL: {bool(SUPABASE_URL)}")
print(f"DEBUG: Found SUPABASE_KEY: {bool(SUPABASE_KEY)}")
print(f"DEBUG: Found DATABASE_URL: {bool(DATABASE_URL)}")

if not SUPABASE_URL or not SUPABASE_KEY or not DATABASE_URL:
    print("❌ Error: Missing environment variables. Please check .env file.")
    print("Required: SUPABASE_URL, SUPABASE_KEY, DATABASE_URL")
    exit(1)

# 2. Setup Clients
# ------------------------------------------------------------------------------
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Failed to initialize Supabase client: {e}")
    exit(1)

def get_db_connection():
    try:
        # Clean DATABASE_URL for psycopg2 (remove params like pgbouncer=true)
        clean_url = DATABASE_URL.split('?')[0]
        # print(f"DEBUG: Connecting to {clean_url}")
        conn = psycopg2.connect(clean_url)
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        exit(1)

# 3. Processing Functions
# ------------------------------------------------------------------------------

def download_image(url):
    """Downloads image from URL into a byte stream."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, stream=True, timeout=10)
        response.raise_for_status()
        return io.BytesIO(response.content)
    except Exception as e:
        # print(f"⚠️ Error downloading {url}: {e}")
        return None

def process_image_rembg(image_bytes):
    """Removes background from image bytes using rembg (Node Bridge)."""
    try:
        # Convert BytesIO to bytes
        input_bytes = image_bytes.getvalue()
        output_bytes = remove(input_bytes)
        return output_bytes
    except Exception as e:
        print(f"⚠️ Error processing image with rembg: {e}")
        return None

def upload_to_supabase(bucket_name, file_name, file_data):
    """Uploads file to Supabase Storage and returns public URL."""
    try:
        # Check if file exists (optional, or just overwrite)
        # supabase.storage.from_(bucket_name).remove([file_name]) # Uncomment to force clean

        # Upload
        # file_data can be bytes
        res = supabase.storage.from_(bucket_name).upload(
            file=file_data,
            path=file_name,
            file_options={"content-type": "image/png", "upsert": "true"}
        )
        
        # Get Public URL
        public_url_res = supabase.storage.from_(bucket_name).get_public_url(file_name)
        return public_url_res
    except Exception as e:
        print(f"⚠️ Error uploading to Supabase: {e}")
        return None

# 4. Main Workflow
# ------------------------------------------------------------------------------
def main():
    print("🚀 Starting Batch Image Processing...")
    
    # Connect to DB
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=DictCursor)

    # Fetch Products
    print("🔍 Fetching products from database...")
    try:
        # Note: Using double quotes for "Product" table as Prisma typically uses case-sensitive names
        cur.execute('SELECT product_id, main_image_url FROM "Product" WHERE main_image_url IS NOT NULL')
        products = cur.fetchall()
        print(f"📦 Found {len(products)} products.")
    except Exception as e:
        print(f"❌ Error fetching products: {e}")
        conn.close()
        exit(1)

    # Process Loop
    success_count = 0
    fail_count = 0
    skip_count = 0

    BUCKET_NAME = "product"

    for product in tqdm(products, desc="Processing Images"):
        pid = product['product_id']
        original_url = product['main_image_url']

        # Skip if already processed (simple heuristic: implies it's already on our supabase)
        if SUPABASE_URL in original_url:
            skip_count += 1
            continue
        
        # 1. Download
        image_stream = download_image(original_url)
        if not image_stream:
            fail_count += 1
            continue

        # 2. Remove Background
        processed_bytes = process_image_rembg(image_stream)
        if not processed_bytes:
            fail_count += 1
            continue

        # 3. Upload to Supabase
        filename = f"processed_{pid}.png"
        new_url = upload_to_supabase(BUCKET_NAME, filename, processed_bytes)

        if new_url:
            # 4. Update Database
            try:
                update_sql = 'UPDATE "Product" SET main_image_url = %s WHERE product_id = %s'
                cur.execute(update_sql, (new_url, pid))
                conn.commit()
                success_count += 1
            except Exception as e:
                print(f"❌ Error updating DB for product {pid}: {e}")
                conn.rollback()
                fail_count += 1
        else:
            fail_count += 1
            
        # Optional: Sleep briefly to avoid rate limits if necessary
        # time.sleep(0.1)

    print("\n==========================================")
    print("✅ Processing Complete")
    print(f"🟢 Successful: {success_count}")
    print(f"🔴 Failed: {fail_count}")
    print(f"⚪ Skipped (Already processed): {skip_count}")
    print("==========================================")

    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
