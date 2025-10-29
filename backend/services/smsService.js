import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendWelcomeSMS = async (phone, name) => {
  if (!client) {
    console.log("⚠️ SMS not configured - Twilio client not initialized");
    return;
  }
  if (!phone) {
    console.log("⚠️ SMS skipped - No phone number provided");
    return;
  }
  try {
    const message = await client.messages.create({
      body: `Welcome ${name} to BridgeHer! Start your learning journey today. Visit: ${process.env.FRONTEND_URL}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("✅ Welcome SMS sent successfully to:", phone);
    console.log("📱 Message SID:", message.sid);
  } catch (error) {
    console.error("❌ SMS ERROR - Failed to send welcome SMS:");
    console.error("   To:", phone);
    console.error("   From:", process.env.TWILIO_PHONE_NUMBER);
    console.error("   Error:", error.message);
    if (error.code) console.error("   Twilio Error Code:", error.code);
    console.error("   Full error:", error);
  }
};

export const sendCourseCompletionSMS = async (phone, name, courseTitle) => {
  if (!client) {
    console.log("SMS not configured, skipping completion SMS");
    return;
  }
  try {
    await client.messages.create({
      body: `Congratulations ${name}! You completed "${courseTitle}". Your certificate is ready at ${process.env.FRONTEND_URL}/certificates`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("Completion SMS sent to:", phone);
  } catch (error) {
    console.error("SMS error:", error);
  }
};

export const sendMentorshipSMS = async (phone, name, mentorName) => {
  if (!client) {
    console.log("SMS not configured, skipping mentorship SMS");
    return;
  }
  try {
    await client.messages.create({
      body: `Hi ${name}! ${mentorName} accepted your mentorship request. Check your dashboard: ${process.env.FRONTEND_URL}/dashboard`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("Mentorship SMS sent to:", phone);
  } catch (error) {
    console.error("SMS error:", error);
  }
};

export const sendMentorshipRequestSMS = async (mentorPhone, mentorName, learnerName, topic) => {
  if (!client) {
    console.log("⚠️ SMS not configured, skipping mentorship request SMS");
    return;
  }
  if (!mentorPhone) {
    console.log("⚠️ SMS skipped - No phone number provided");
    return;
  }
  try {
    await client.messages.create({
      body: `Hi ${mentorName}! ${learnerName} requested mentorship on "${topic}". Check: ${process.env.FRONTEND_URL}/dashboard`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mentorPhone,
    });
    console.log("✅ Mentorship request SMS sent to mentor:", mentorPhone);
  } catch (error) {
    console.error("❌ SMS error:", error.message);
  }
};

export const sendMentorshipConfirmationSMS = async (learnerPhone, learnerName, mentorName, topic) => {
  if (!client) {
    console.log("⚠️ SMS not configured, skipping confirmation SMS");
    return;
  }
  if (!learnerPhone) {
    console.log("⚠️ SMS skipped - No phone number provided");
    return;
  }
  try {
    await client.messages.create({
      body: `Hi ${learnerName}! Your mentorship request to ${mentorName} on "${topic}" has been submitted. Check: ${process.env.FRONTEND_URL}/dashboard`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: learnerPhone,
    });
    console.log("✅ Mentorship confirmation SMS sent to learner:", learnerPhone);
  } catch (error) {
    console.error("❌ SMS error:", error.message);
  }
};
