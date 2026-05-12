import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/debug", (req, res) => {
  const emailUser = process.env.EMAIL_USER || "";
  const emailPass = process.env.EMAIL_PASS || "";
  const testTo = process.env.TEST_EMAIL_TO || "";

  return res.json({
    success: true,
    config: {
      EMAIL_HOST: process.env.EMAIL_HOST || null,
      EMAIL_PORT: process.env.EMAIL_PORT || null,
      EMAIL_USER_SET: Boolean(emailUser),
      EMAIL_USER_IS_PLACEHOLDER: emailUser.includes("your_real_gmail"),
      EMAIL_PASS_SET: Boolean(emailPass),
      EMAIL_PASS_LENGTH_WITHOUT_SPACES: emailPass.replace(/\s/g, "").length,
      EMAIL_PASS_IS_PLACEHOLDER: emailPass.includes("your_google_app_password"),
      EMAIL_FROM: process.env.EMAIL_FROM || null,
      EMAIL_FROM_IS_PLACEHOLDER: (process.env.EMAIL_FROM || "").includes("your_real_gmail"),
      TEST_EMAIL_TO_SET: Boolean(testTo),
      TEST_EMAIL_TO_IS_PLACEHOLDER: testTo.includes("your_personal_email"),
    },
  });
});

router.get("/send-test", async (req, res) => {
  try {
    const to = req.query.to || process.env.TEST_EMAIL_TO || process.env.EMAIL_USER;

    if (!to || String(to).includes("your_personal_email")) {
      return res.status(400).json({
        success: false,
        message: "Set TEST_EMAIL_TO to your real email in .env, or call /api/test-email/send-test?to=you@example.com",
      });
    }

    await sendEmail({
      to,
      subject: "CampusTracker Test Email",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;padding:24px">
          <h1>CampusTracker Email Test</h1>
          <p>If you received this email, OTP email sending is configured correctly.</p>
        </div>
      `,
      text: "CampusTracker Email Test: If you received this email, OTP email sending is configured correctly.",
    });

    return res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email route failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
