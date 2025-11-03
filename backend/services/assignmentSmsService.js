import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendAssignmentSubmittedSMS = async (phoneNumber, name, assignmentTitle) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi ${name}! Your assignment "${assignmentTitle}" has been submitted successfully on BridgeHer.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Assignment submitted SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};

export const sendAssignmentGradedSMS = async (phoneNumber, name, assignmentTitle, score) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi ${name}! Your assignment "${assignmentTitle}" has been graded. Score: ${score}. Check BridgeHer for details.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Assignment graded SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};
