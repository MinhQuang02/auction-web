import nodemailer from "nodemailer";
import {
  getOtpTemplate,
  getQuestionTemplate,
  getBuyerReceiptTemplate,
  getSellerOrderTemplate,
  getOutbidTemplate,
  getResetLinkTemplate,
  getBidderKickTemplate,
  getNewPasswordTemplate,
  getProductUpdateTemplate,
} from "../utils/emailTemplates.js";

// Configure Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Fallback or use host/port if provided
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    if (!to) return;
    const info = await transporter.sendMail({
      from: `"bid.dify" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] Sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[EmailService] Failed to send to ${to}:`, error.message);
  }
};

class EmailService {
  // A. Auth
  async sendOtp(email, otp, type = "verification") {
    const html = getOtpTemplate(otp, type);
    await sendEmail(
      email,
      `${type === "reset" ? "Reset Password" : "Verify Email"} - bid.dify`,
      html
    );
  }

  async sendResetLink(email, link) {
    const html = getResetLinkTemplate(link);
    await sendEmail(email, "Reset Your Password - bid.dify", html);
  }

  // B. Ask Seller
  async sendQuestionNotification(
    sellerEmail,
    sellerName,
    askerName,
    productName,
    productId,
    questionText
  ) {
    const productUrl = `${process.env.FRONTEND_URL}/product/${productId}`;
    const html = getQuestionTemplate(
      sellerName,
      askerName,
      productName,
      productUrl,
      questionText
    );
    await sendEmail(sellerEmail, `New Question: ${productName}`, html);
  }

  // C. Transaction
  async sendTransactionEmails(
    buyer,
    seller,
    product,
    transaction,
    shippingData
  ) {
    // Buyer Receipt
    const buyerHtml = getBuyerReceiptTemplate(
      buyer.full_name,
      transaction,
      product
    );
    sendEmail(
      buyer.email,
      `Receipt for Order #${transaction.transaction_id}`,
      buyerHtml
    );

    // Seller Notification
    const sellerHtml = getSellerOrderTemplate(
      seller.full_name,
      transaction,
      product,
      shippingData
    );
    sendEmail(seller.email, `Item Sold: ${product.name}`, sellerHtml);
  }

  // D. Outbid
  async sendOutbidNotifications(bidders, productName, productId, newPrice) {
    if (!bidders || bidders.length === 0) return;

    const productUrl = `${process.env.FRONTEND_URL}/product/${productId}`;

    // Send in parallel but catch errors individually
    const promises = bidders.map((bidder) => {
      const html = getOutbidTemplate(
        bidder.full_name,
        productName,
        productUrl,
        newPrice
      );
      return sendEmail(bidder.email, `Outbid Alert: ${productName}`, html);
    });

    Promise.allSettled(promises);
  }

  // E. Kick Notification
  async sendBidderKickNotification(email, fullName, productName, productUrl) {
    const html = getBidderKickTemplate(fullName, productName, productUrl);
    await sendEmail(
      email,
      `Auction Alert: You have been removed from ${productName}`,
      html
    );
  }

  async sendNewPasswordEmail(email, fullName, newPassword) {
    const html = getNewPasswordTemplate(fullName, newPassword);
    await sendEmail(email, "Your New Password - bid.dify", html);
  }

  async sendProductUpdateNotification(email, fullName, productName, productId, updateContent) {
    const productUrl = `${process.env.FRONTEND_URL}/product/${productId}`;
    const html = getProductUpdateTemplate(fullName, productName, productUrl, updateContent);
    await sendEmail(email, `Update on ${productName}`, html);
  }
}

export default new EmailService();
