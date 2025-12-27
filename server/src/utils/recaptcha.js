import fetch from "node-fetch";

export async function verifyRecaptcha(token) {
  if (!token) return false;

  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) {
    throw new Error("RECAPTCHA_SECRET not set");
  }

  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    }
  );

  const data = await response.json();

  return data.success === true;
}

export default verifyRecaptcha;
