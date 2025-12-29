-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('bidder', 'seller', 'admin');

-- CreateEnum
CREATE TYPE "product_status_enum" AS ENUM ('active', 'sold', 'ended_no_winner', 'removed');

-- CreateEnum
CREATE TYPE "transaction_status_enum" AS ENUM ('pending_payment', 'pending_shipping', 'shipped', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255),
    "address" TEXT,
    "dob" DATE,
    "role" "user_role_enum" NOT NULL DEFAULT 'bidder',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp" VARCHAR(255),
    "otp_expires" TIMESTAMP,
    "upgrade_request_time" TIMESTAMP,
    "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_price" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "step_price" DECIMAL(12,2) NOT NULL,
    "buy_now_price" DECIMAL(12,2),
    "current_price" DECIMAL(12,2) NOT NULL,
    "bid_count" INTEGER NOT NULL DEFAULT 0,
    "main_image_url" TEXT NOT NULL,
    "start_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP NOT NULL,
    "auto_extend_enabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "product_status_enum" NOT NULL DEFAULT 'active',
    "seller_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "current_bidder_id" INTEGER,
    "winner_id" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Product_Image" (
    "image_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "Product_Image_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "Product_Description_History" (
    "desc_history_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "added_description" TEXT NOT NULL,
    "added_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_Description_History_pkey" PRIMARY KEY ("desc_history_id")
);

-- CreateTable
CREATE TABLE "Bid_History" (
    "bid_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,
    "max_bid_amount" DECIMAL(12,2) NOT NULL,
    "bid_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_History_pkey" PRIMARY KEY ("bid_id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("user_id","product_id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "rating_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "rated_user_id" INTEGER NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "Product_Question" (
    "question_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "asker_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "answer_text" TEXT,
    "answer_time" TIMESTAMP,

    CONSTRAINT "Product_Question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "Banned_Bidder" (
    "product_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,

    CONSTRAINT "Banned_Bidder_pkey" PRIMARY KEY ("product_id","bidder_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "status" "transaction_status_enum" NOT NULL,
    "payment_proof" TEXT,
    "shipping_address" TEXT,
    "shipping_proof" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "Chat_Message" (
    "message_id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "message_text" TEXT NOT NULL,
    "sent_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "System_Config" (
    "setting_key" VARCHAR(50) NOT NULL,
    "setting_value" VARCHAR(100) NOT NULL,

    CONSTRAINT "System_Config_pkey" PRIMARY KEY ("setting_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Product_end_time_idx" ON "Product"("end_time");

-- CreateIndex
CREATE INDEX "Product_current_price_idx" ON "Product"("current_price");

-- CreateIndex
CREATE INDEX "Product_bid_count_idx" ON "Product"("bid_count");

-- CreateIndex
CREATE INDEX "Product_name_description_idx" ON "Product"("name", "description");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_product_id_key" ON "Transaction"("product_id");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_current_bidder_id_fkey" FOREIGN KEY ("current_bidder_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Image" ADD CONSTRAINT "Product_Image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Description_History" ADD CONSTRAINT "Product_Description_History_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid_History" ADD CONSTRAINT "Bid_History_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid_History" ADD CONSTRAINT "Bid_History_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rater_id_fkey" FOREIGN KEY ("rater_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rated_user_id_fkey" FOREIGN KEY ("rated_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Question" ADD CONSTRAINT "Product_Question_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Question" ADD CONSTRAINT "Product_Question_asker_id_fkey" FOREIGN KEY ("asker_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned_Bidder" ADD CONSTRAINT "Banned_Bidder_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned_Bidder" ADD CONSTRAINT "Banned_Bidder_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
