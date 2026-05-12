import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendCredentialEmail(
  to: string,
  name: string,
  credential: string,
  type: "temp-password" | "reset-link"
) {
  const isPassword = type === "temp-password";
  const subject = isPassword 
    ? "Welcome to University Research System - Your Account Details" 
    : "Password Reset Request - University Research System";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #0f172a;">Hello, ${name}</h2>
      <p style="color: #334155; font-size: 16px;">
        ${isPassword 
          ? "An account has been created for you on the University Research System." 
          : "We received a request to reset your password for the University Research System."}
      </p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #475569; font-size: 14px; font-weight: bold;">
          ${isPassword ? "Your Temporary Password:" : "Your Password Reset Link:"}
        </p>
        <p style="margin: 10px 0 0 0; font-size: 18px; font-family: monospace; color: #2563eb; font-weight: bold; word-break: break-all;">
          ${credential}
        </p>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        ${isPassword 
          ? "Please log in using this password and change it immediately from your profile settings." 
          : "This link is valid for 24 hours. If you did not request this, please ignore this email."}
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        University Research System Administration
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Admin | University Research" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}