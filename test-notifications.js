// Test Email and SMS Notifications
// Run: node test-notifications.js

import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

console.log("═══════════════════════════════════════════════════════════");
console.log("  TESTING BRIDGEHER NOTIFICATIONS");
console.log("═══════════════════════════════════════════════════════════\n");

// Test Email
async function testEmail() {
  console.log("📧 Testing Email...");
  
  if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === "your_gmail_app_password") {
    console.log("❌ Email NOT configured - Update EMAIL_PASSWORD in .env\n");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "✅ BridgeHer Email Test",
      html: "<h2>Success!</h2><p>Email notifications are working! 🎉</p>",
    });

    console.log("✅ Email WORKING - Check your inbox!\n");
    return true;
  } catch (error) {
    console.log("❌ Email FAILED:", error.message);
    console.log("   → Check EMAIL_PASSWORD in .env\n");
    return false;
  }
}

// Test SMS
async function testSMS() {
  console.log("📱 Testing SMS...");
  
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === "dummy_sid") {
    console.log("⚠️  SMS NOT configured - Update Twilio credentials in .env\n");
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: "✅ BridgeHer SMS Test - Notifications working! 🎉",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.TWILIO_PHONE_NUMBER, // Send to yourself for testing
    });

    console.log("✅ SMS WORKING - Check your phone!\n");
    return true;
  } catch (error) {
    console.log("❌ SMS FAILED:", error.message);
    console.log("   → Check Twilio credentials in .env\n");
    return false;
  }
}

// Run tests
(async () => {
  const emailWorks = await testEmail();
  const smsWorks = await testSMS();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`Email: ${emailWorks ? "✅ WORKING" : "❌ NOT WORKING"}`);
  console.log(`SMS:   ${smsWorks ? "✅ WORKING" : "⚠️  NOT CONFIGURED"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  if (emailWorks && smsWorks) {
    console.log("🎉 All notifications working! You're ready to go!\n");
  } else if (emailWorks) {
    console.log("✅ Email working! SMS is optional.\n");
  } else {
    console.log("⚠️  Update credentials in backend/.env and try again.\n");
  }
})();
