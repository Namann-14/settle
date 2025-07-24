import { Resend } from "resend";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Simple test script to verify Resend integration
export async function testEmailService() {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('RESEND')));
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Test with a simple email to yourself (replace with your actual email)
    const result = await resend.emails.send({
      from: "Settle <noreply@resend.dev>",
      to: "test@example.com", // This won't actually send since it's a test email
      subject: "Test Email from Settle",
      html: "<p>This is a test email to verify Resend configuration.</p>",
    });

    if (result.error) {
      console.error("❌ Email test failed:", result.error);
      return false;
    }

    console.log("✅ Email service test passed");
    console.log("Email ID:", result.data?.id);
    return true;
  } catch (error) {
    console.error("❌ Email service error:", error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEmailService();
}
