const BRAND_COLORS = {
  primary: "#AE9B84",
  background: "#f7e3d1ff", // Stronger yellow-brown (Cafe au lait)
  text: "#1f1f1f",
  white: "#f8eddfff",
  border: "#C0A88C"
};

const getBaseTemplate = (content, title = "Notification") => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BRAND_COLORS.background}; color: ${BRAND_COLORS.text}; }
    .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border-radius: 12px; overflow: hidden; margin-top: 30px; box-shadow: 0 8px 16px rgba(60, 45, 30, 0.15); }
    .header { background-color: ${BRAND_COLORS.primary}; color: ${BRAND_COLORS.white}; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: 800; }
    .content { padding: 40px 30px; line-height: 1.6; background-color: ${BRAND_COLORS.white}; }
    .footer { background-color: #5E4B35; padding: 30px; text-align: center; font-size: 13px; color: #E0E0E0; }
    .footer p { margin: 5px 0; }
    .btn { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLORS.primary}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
    .btn:hover { background-color: #96836C; }
    .info-box { background-color: #FAF8F5; border: 1px solid ${BRAND_COLORS.border}; border-radius: 6px; padding: 20px; margin: 25px 0; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #E5E5E5; padding-bottom: 5px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #888; font-size: 14px; }
    .info-value { font-weight: bold; font-size: 14px; color: ${BRAND_COLORS.text}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>bid.dify</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} bid.dify by CodeShift. All rights reserved.</p>
      <p>227, Nguyen Van Cu Street, Ward 4, District 5</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getOtpTemplate = (otp, type = "verification") => {
  const message = type === "reset"
    ? "You requested a password reset. Use the code below to proceed."
    : "Thank you for joining bid.dify! Please verify your email address to activate your account.";

  const content = `
    <h2 style="margin-top: 0;">${type === "reset" ? "Reset Password" : "Verify Your Email"}</h2>
    <p>${message}</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${BRAND_COLORS.text}; background: #f0f0f0; padding: 10px 20px; border-radius: 8px; border: 1px dashed #ccc;">${otp}</span>
    </div>
    <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
  `;
  return getBaseTemplate(content, "Security Code");
};

export const getResetLinkTemplate = (link) => {
  const content = `
      <h2 style="margin-top: 0;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" class="btn">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #999;">Or copy this link to your browser: <br> <a href="${link}" style="color: #666;">${link}</a></p>
      <p>This link expires in 15 minutes.</p>
    `;
  return getBaseTemplate(content, "Reset Password");
};

export const getQuestionTemplate = (sellerName, askerName, productName, productUrl, questionText) => {
  const content = `
    <h2>New Question Received</h2>
    <p>Hello <strong>${sellerName}</strong>,</p>
    <p>User <strong>${askerName}</strong> has asked a question about your product <strong>${productName}</strong>.</p>
    <div class="info-box">
      <p style="font-style: italic; color: #555;">"${questionText}"</p>
    </div>
    <p>Answering quickly increases your chances of selling!</p>
    <div style="text-align: center;">
      <a href="${productUrl}" class="btn">Reply Now</a>
    </div>
  `;
  return getBaseTemplate(content, "New Question from Buyer");
};

export const getBuyerReceiptTemplate = (userName, transaction, product) => {
  const content = `
    <h2>Payment Receipt</h2>
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Thank you for your purchase! Your payment has been successfully processed.</p>
    
    <div class="info-box">
      <h3>Order Details</h3>
      <div class="info-row">
        <span class="info-label">Product:</span>
        <span class="info-value">${product.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid:</span>
        <span class="info-value">$${Number(product.current_price).toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${new Date().toLocaleDateString()}</span>
      </div>
       <div class="info-row">
        <span class="info-label">Transaction ID:</span>
        <span class="info-value">#${transaction.transaction_id}</span>
      </div>
    </div>
    
    <p>The seller will be notified to ship your item. You can track the status in your account.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || '#'}/my-purchases" class="btn">View Order</a>
    </div>
  `;
  return getBaseTemplate(content, "Payment Receipt");
};

export const getSellerOrderTemplate = (sellerName, transaction, product, shippingData) => {
  const address = typeof shippingData === 'string' ? JSON.parse(shippingData || '{}') : shippingData;
  const addressStr = `${address.address}, ${address.city}`;

  const content = `
    <h2>New Order Received!</h2>
    <p>Good news, <strong>${sellerName}</strong>!</p>
    <p>Your item <strong>${product.name}</strong> has been sold and paid for.</p>
    
    <div class="info-box">
      <h3>Shipping Information</h3>
      <p><strong>${address.firstName || 'Buyer'}</strong><br>
      ${address.address}<br>
      ${address.city}<br>
      ${address.phone}</p>
    </div>

    <div class="info-box">
      <h3>Transaction Details</h3>
      <div class="info-row">
        <span class="info-label">Sale Price:</span>
        <span class="info-value">$${Number(product.current_price).toLocaleString()}</span>
      </div>
    </div>

    <p>Please ship the item as soon as possible to maintain a high rating.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || '#'}/my-products" class="btn">Manage Order</a>
    </div>
  `;
  return getBaseTemplate(content, "You made a sale!");
};

export const getOutbidTemplate = (bidderName, productName, productUrl, newPrice) => {
  const content = `
    <h2>You've Been Outbid!</h2>
    <p>Hi <strong>${bidderName}</strong>,</p>
    <p>Another user has placed a higher bid on <strong>${productName}</strong>.</p>
    
    <div style="text-align: center; margin: 20px 0;">
      <p style="font-size: 14px; color: #666;">Current Price</p>
      <p style="font-size: 24px; font-weight: bold; color: #AE9B84;">$${Number(newPrice).toLocaleString()}</p>
    </div>
    
    <p>Don't miss out! Place a new bid to reclaim your winning position.</p>
    <div style="text-align: center;">
      <a href="${productUrl}" class="btn">Bid Again</a>
    </div>
  `;
  return getBaseTemplate(content, "Auction Update: Outbid!");
};
export const getBidderKickTemplate = (bidderName, productName, productUrl) => {
  const content = `
    <h2>Notification of Removal</h2>
    <p>Hi <strong>${bidderName}</strong>,</p>
    <p>Use to the decision of the seller, you have been removed from the auction for <strong>${productName}</strong>.</p>
    <p>Your bids have been cancelled. If you believe this is an error, please contact the seller or support.</p>
    
    <div style="text-align: center;">
      <a href="${productUrl}" class="btn">View Auction</a>
    </div>
  `;
  return getBaseTemplate(content, "Auction Notification");
};
