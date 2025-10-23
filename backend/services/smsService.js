import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendWelcomeSMS = async (phone, name) => {
  if (!client) {
    console.log("SMS not configured, skipping welcome SMS");
    return;
  }
  try {
    await client.messages.create({
      body: `Welcome ${name} to BridgeHer! Start your learning journey today. Visit: ${process.env.FRONTEND_URL}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    console.log("Welcome SMS sent to:", phone);
  } catch (error) {
    console.error("SMS error:", error);
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
