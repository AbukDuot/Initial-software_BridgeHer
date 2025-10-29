import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to BridgeHer! 🎉",
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining BridgeHer - Your journey to empowerment starts now!</p>
      <p>Explore our courses, connect with mentors, and grow your skills.</p>
      <a href="${process.env.FRONTEND_URL}/courses">Browse Courses</a>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully to:", email);
    console.log("📧 Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ EMAIL ERROR - Failed to send welcome email:");
    console.error("   To:", email);
    console.error("   Error:", error.message);
    console.error("   Full error:", error);
  }
};

export const sendCourseCompletionEmail = async (email, name, courseTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎓 Congratulations! Course Completed",
    html: `
      <h2>Congratulations ${name}! 🎉</h2>
      <p>You have successfully completed: <strong>${courseTitle}</strong></p>
      <p>Your certificate is ready!</p>
      <a href="${process.env.FRONTEND_URL}/certificates">View Certificate</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Completion email sent to:", email);
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - BridgeHer",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset email sent to:", email);
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendMentorshipNotification = async (email, name, mentorName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mentorship Request Accepted! 🤝",
    html: `
      <h2>Great News ${name}!</h2>
      <p>${mentorName} has accepted your mentorship request.</p>
      <p>Check your dashboard for session details.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mentorship email sent to:", email);
  } catch (error) {
    console.error("Email error:", error);
  }
};

export const sendMentorshipRequestEmail = async (mentorEmail, mentorName, learnerName, topic, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: mentorEmail,
    subject: "New Mentorship Request - BridgeHer 🤝",
    html: `
      <h2>Hi ${mentorName}!</h2>
      <p><strong>${learnerName}</strong> has requested mentorship from you.</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Please review and respond to this request.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">View Request</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mentorship request email sent to mentor:", mentorEmail);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

export const sendMentorshipConfirmationEmail = async (learnerEmail, learnerName, mentorName, topic) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: learnerEmail,
    subject: "Mentorship Request Submitted - BridgeHer ✅",
    html: `
      <h2>Hi ${learnerName}!</h2>
      <p>Your mentorship request to <strong>${mentorName}</strong> has been submitted successfully.</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p>You will be notified once the mentor responds to your request.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mentorship confirmation email sent to learner:", learnerEmail);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};
