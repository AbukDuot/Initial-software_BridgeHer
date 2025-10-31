import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendCourseCompletionSMS = async (phoneNumber, name, courseTitle) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Congratulations ${name}! You've completed ${courseTitle}. Your certificate is ready at BridgeHer.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};

export const sendEnrollmentSMS = async (phoneNumber, name, courseTitle) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi ${name}! You've enrolled in ${courseTitle} on BridgeHer. Start learning now!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(' Enrollment SMS sent to:', phoneNumber);
  } catch (error) {
    console.error(' SMS error:', error.message);
  }
};

export const sendMentorshipSMS = async (phoneNumber, name, mentorName) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi ${name}! ${mentorName} has accepted your mentorship request on BridgeHer. Check your dashboard.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log(' Mentorship SMS sent to:', phoneNumber);
  } catch (error) {
    console.error(' SMS error:', error.message);
  }
};

export const sendWelcomeSMS = async (phoneNumber, name) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Welcome to BridgeHer, ${name}! Start your learning journey today.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Welcome SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};

export const sendMentorshipRequestSMS = async (phoneNumber, learnerName) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi! ${learnerName} has sent you a mentorship request on BridgeHer. Check your dashboard.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Mentorship request SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};

export const sendMentorshipConfirmationSMS = async (phoneNumber, name, mentorName) => {
  if (!twilioClient) {
    console.log('SMS not configured');
    return;
  }
  
  try {
    await twilioClient.messages.create({
      body: `Hi ${name}! ${mentorName} has confirmed your mentorship on BridgeHer. Start your journey!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('Mentorship confirmation SMS sent to:', phoneNumber);
  } catch (error) {
    console.error('SMS error:', error.message);
  }
};
