import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async function (to, subject, html) {
  // send email
  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (info.rejected.length > 0) {
      console.warn("Some recipients were rejected:", info.rejected);
    }
    return info;
  } catch (err) {
    switch (err.code) {
      case "ECONNECTION":
      case "ETIMEDOUT":
        console.error("Network error - retry later:", err.message);
        break;
      case "EAUTH":
        console.error("Authentication failed:", err.message);
        break;
      case "EENVELOPE":
        console.error("Invalid recipients:", err.rejected);
        break;
      default:
        console.error("Send failed:", err.message);
    }
    throw err; // rethrow to let caller handle retries or user feedback
  }
};

const sendVerificationEmail = async function (email, token) {
  const url = `${process.env.CLIENT_URL}/api/auth/verify-email/${token}`;
  await sendEmail(
    email,
    "Verify your email",
    `<h2>Welcome!</h2><p>Click <a href="${url}">here</a> to verify your email.</p>`,
  );
};

const sendRestPasswordEmail = async function (email, token) {
  const url = `${process.env.CLIENT_URL}/api/auth/reset-password/${token}`;
  await sendEmail(
    email,
    "Reset your password",
    `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  );
};

const sendOrderConfirmationEmail = async (email, order) => {
  const items = order.items
    .map((item) => `<li>${item.title} X ${item.quantity} = ₹${item.price}</li>`)
    .join("");

  await sendEmail(
    email,
    `Order Confirmed - ${order.orderNumber}`,
    `<h2>Order Confirmed!</h2>
     <p>Order: ${order.orderNumber}</p>
     <ul>${items}</ul>
     <p><strong>Total: ₹${order.totalAmount}</strong></p>`,
  );
};

export {
  sendEmail,
  sendVerificationEmail,
  sendRestPasswordEmail,
  sendOrderConfirmationEmail,
  transporter,
};
