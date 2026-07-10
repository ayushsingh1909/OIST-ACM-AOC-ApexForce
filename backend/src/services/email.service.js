import nodemailer from "nodemailer";

class EmailService {
  /**
   * Creates a nodemailer transporter using SMTP environment configurations.
   */
  getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT, 10) || 2525,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || ""
      }
    });
  }

  /**
   * Sends a reset password email.
   * Falls back to logging to console if credentials are empty or sending fails.
   * @param {string} toEmail 
   * @param {string} resetLink 
   */
  async sendResetPasswordEmail(toEmail, resetLink) {
    const from = process.env.SMTP_FROM || "noreply@acie.ai";
    const mailOptions = {
      from: `"ACIE Career Portal" <${from}>`,
      to: toEmail,
      subject: "ACIE - Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">ACIE - AI Career Intelligence Engine</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p>Hello,</p>
          <p>You requested a password reset for your ACIE account. Click the button below to set a new password. This link is valid for 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `
    };

    const hasCreds = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!hasCreds) {
      console.log("\n=======================================================");
      console.log("SMTP Credentials missing in .env.");
      console.log(`Reset link for ${toEmail}:`);
      console.log(resetLink);
      console.log("=======================================================\n");
      return;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email successfully sent to ${toEmail}`);
    } catch (error) {
      console.error("Failed to send password reset email via SMTP, logging link as fallback:", error);
      console.log("\n=======================================================");
      console.log("FALLBACK PASSWORD RESET LINK:");
      console.log(resetLink);
      console.log("=======================================================\n");
    }
  }
}

export default new EmailService();
