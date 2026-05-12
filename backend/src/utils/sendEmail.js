import { Resend } from "resend";

function requiredEmailEnv() {
  const missing = ["RESEND_API_KEY", "EMAIL_FROM"].filter(
    (key) => !process.env[key]
  );

  if (missing.length) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  requiredEmailEnv();

  try {
    console.log("Sending email using Resend to:", to);

    const info = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      to,
      subject,
      message: error.message,
      response: error.response,
      name: error.name,
    });

    throw error;
  }
};

export function otpEmailTemplate(otp) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:28px;color:#111827">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden">
        <div style="background:#050816;padding:24px 28px">
          <h1 style="margin:0;color:#ffffff;font-size:24px">
            Campus<span style="color:#06B6D4">Tracker</span>
          </h1>
          <p style="margin:8px 0 0;color:#94A3B8">Email Verification</p>
        </div>

        <div style="padding:28px">
          <h2 style="margin:0 0 12px;font-size:22px;color:#111827">
            Verify your email address
          </h2>

          <p style="margin:0 0 18px;color:#475569;line-height:1.6">
            Your CampusTracker verification OTP is:
          </p>

          <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#f3f4f6;color:#111827;border-radius:12px;padding:16px 20px;text-align:center;margin:20px 0;width:fit-content">
            ${otp}
          </div>

          <p style="margin:18px 0;color:#b45309">
            This OTP expires in 10 minutes.
          </p>

          <p style="margin:0;color:#64748B;font-size:13px">
            Do not share this OTP with anyone. CampusTracker will never ask for your password or OTP outside the app.
          </p>
        </div>
      </div>
    </div>
  `;
}

export { sendEmail };
export default sendEmail;