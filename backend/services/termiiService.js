import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "BridgeHer";

export const sendWelcomeSMS = async (phone, name) => {
  if (!TERMII_API_KEY) {
    console.log("Termii not configured, skipping SMS");
    return;
  }

  try {
    await axios.post("https://api.ng.termii.com/api/sms/send", {
      to: phone,
      from: TERMII_SENDER_ID,
      sms: `Welcome ${name} to BridgeHer! Start your learning journey today. Visit: ${process.env.FRONTEND_URL}`,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    });
    console.log("Welcome SMS sent to:", phone);
  } catch (error) {
    console.error("Termii SMS error:", error.response?.data || error.message);
  }
};

export const sendMentorshipSMS = async (phone, name, mentorName) => {
  if (!TERMII_API_KEY) return;

  try {
    await axios.post("https://api.ng.termii.com/api/sms/send", {
      to: phone,
      from: TERMII_SENDER_ID,
      sms: `Hi ${name}! ${mentorName} accepted your mentorship request. Check your dashboard: ${process.env.FRONTEND_URL}/dashboard`,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    });
    console.log("Mentorship SMS sent to:", phone);
  } catch (error) {
    console.error("Termii SMS error:", error.response?.data || error.message);
  }
};
