import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendWelcomeEmail = async (email, name) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("SendGrid not configured, skipping email");
    return;
  }

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Welcome to BridgeHer! 🎉",
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Thank you for joining BridgeHer - Your journey to empowerment starts now!</p>
        <p>Explore our courses, connect with mentors, and grow your skills.</p>
        <a href="${process.env.FRONTEND_URL}/courses">Browse Courses</a>
      `,
    });
    console.log("Welcome email sent to:", email);
  } catch (error) {
    console.error("SendGrid error:", error);
  }
};

export const sendLoginEmail = async (email, name) => {
  if (!process.env.SENDGRID_API_KEY) return;

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Login Notification - BridgeHer",
      html: `<h2>Hi ${name}!</h2><p>You logged in to BridgeHer at ${new Date().toLocaleString()}.</p>`,
    });
  } catch (error) {
    console.error("SendGrid error:", error);
  }
};
