import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
console.log("=== SENDGRID CONFIG DEBUG ===");
console.log("SendGrid API Key exists:", !!process.env.SENDGRID_API_KEY);
console.log("SendGrid API Key length:", process.env.SENDGRID_API_KEY?.length);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("============================");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Check if email is properly configured
const isEmailConfigured = () => {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const email = process.env.EMAIL_USER;
  return sendgridKey && email;
};

// Reusable SendGrid email function
const sendEmail = async (to, subject, text, htmlContent = null) => {
  console.log("=== SENDGRID EMAIL DEBUG ===");
  console.log("Sending to:", to);
  console.log("From:", process.env.EMAIL_USER);
  console.log("Subject:", subject);
  console.log("SendGrid API Key loaded:", !!process.env.SENDGRID_API_KEY);
  console.log("============================");
  
  const msg = {
    to,
    from: process.env.EMAIL_USER,
    subject,
    text,
  };

  if (htmlContent) {
    msg.html = htmlContent;
  }

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    console.error("Error details:", JSON.stringify(error.response?.body || {}, null, 2));
    return false;
  }
};

export { sendEmail, isEmailConfigured };
