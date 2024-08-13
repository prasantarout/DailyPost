const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    if (error.responseCode === 454) {
      logger.error(
        "Email service connection failed due to too many login attempts. Please try again later."
      );
    } else {
      logger.error("Email service connection failed", error);
    }
  } else {
    logger.info("Email service is ready to send messages");
  }
});

exports.sendOtpToUser = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`OTP sent successfully to ${email}`);
  } catch (error) {
    logger.error("Error sending OTP email", error);
    throw new Error("Error sending OTP email");
  }
};
