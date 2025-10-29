import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendAssignmentSubmittedEmail = async (email, name, assignmentTitle) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Assignment Submitted Successfully",
    html: `<h2>Hi ${name}!</h2><p>Your assignment "${assignmentTitle}" has been submitted successfully.</p>`,
  }).catch(console.error);
};

export const sendAssignmentGradedEmail = async (email, name, assignmentTitle, score) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Assignment Graded",
    html: `<h2>Hi ${name}!</h2><p>Your assignment "${assignmentTitle}" has been graded. Score: ${score}</p>`,
  }).catch(console.error);
};

export const sendEnrollmentEmail = async (email, name, courseTitle) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Course Enrollment Confirmed",
    html: `<h2>Hi ${name}!</h2><p>You've enrolled in "${courseTitle}". Start learning now!</p>`,
  }).catch(console.error);
};
