import nodemailer from "nodemailer";

function requiredEmailEnv() {
  const missing = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM"]
    .filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }

  const placeholders = [
    ["EMAIL_USER", "your_real_gmail@gmail.com"],
    ["EMAIL_PASS", "your_google_app_password"],
    ["EMAIL_FROM", "your_real_gmail@gmail.com"],
  ].filter(([key, value]) => process.env[key]?.includes(value));

  if (placeholders.length) {
    throw new Error(`Email is still using placeholder values: ${placeholders.map(([key]) => key).join(", ")}`);
  }
}

const sendEmail = async ({ to, subject, html, text }) => {
  requiredEmailEnv();

  const emailPass = process.env.EMAIL_PASS.replace(/\s/g, "");
  if (process.env.NODE_ENV !== "production") console.info(`Sending email to: ${to}`);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPass,
    },
  });

  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    if (process.env.NODE_ENV !== "production") console.info(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      to,
      subject,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    throw error;
  }
};

export function otpEmailTemplate(otp) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:28px;color:#111827">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden">
        <div style="background:#050816;padding:24px 28px">
          <h1 style="margin:0;color:#ffffff;font-size:24px">Campus<span style="color:#06B6D4">Tracker</span></h1>
          <p style="margin:8px 0 0;color:#94A3B8">Email Verification</p>
        </div>
        <div style="padding:28px">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111827">Verify your email address</h2>
          <p style="margin:0 0 18px;color:#475569;line-height:1.6">Your CampusTracker verification OTP is:</p>
          <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#f3f4f6;color:#111827;border-radius:12px;padding:16px 20px;text-align:center;margin:20px 0;width:fit-content">
            ${otp}
          </div>
          <p style="margin:18px 0;color:#b45309">This OTP expires in 10 minutes.</p>
          <p style="margin:0;color:#64748B;font-size:13px">Do not share this OTP with anyone. CampusTracker will never ask for your password or OTP outside the app.</p>
        </div>
      </div>
    </div>
  `;
}

export { sendEmail };
export default sendEmail;
