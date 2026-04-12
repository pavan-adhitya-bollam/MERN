import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

// In-memory OTP storage (email → { otp, expiresAt, lastSent })
const otpStore = new Map();

// In-memory password reset token storage (email → { token, expiresAt })
const passwordResetStore = new Map();

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

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send OTP email using SendGrid
export const sendOTPEmail = async (email, otp) => {
  const subject = 'Your OTP Code - DreamHire';
  const text = `Your OTP code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px;">DreamHire</h1>
        <p style="margin: 10px 0; opacity: 0.9;">Email Verification</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #374151; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
          Thank you for registering with DreamHire! To complete your registration, please use the following OTP (One-Time Password) to verify your email address:
        </p>
        
        <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px; margin-bottom: 10px;">Your OTP Code:</p>
          <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          <strong>Important:</strong>
          <br>· This OTP will expire in <strong>5 minutes</strong>
          <br>· Do not share this OTP with anyone
          <br>· If you didn't request this OTP, please ignore this email
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated message from DreamHire. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return await sendEmail(email, subject, text, htmlContent);
};

// Send password reset email using SendGrid
export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log("=== PASSWORD RESET EMAIL DEBUG ===");
  console.log("Email:", email);
  console.log("Reset Token:", resetToken);
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
  
  const resetLink = `${process.env.FRONTEND_URL || 'https://mern-frontend-eight-alpha.vercel.app'}/reset-password?token=${resetToken}&email=${email}`;
  console.log("Generated Reset Link:", resetLink);
  console.log("=================================");
  
  const subject = 'Password Reset Request - DreamHire';
  const text = `Please click the following link to reset your password: ${resetLink}. This link will expire in 15 minutes. If you didn't request this password reset, Please ignore this email.`;
  const htmlContent = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 32px;">DreamHire</h1>
        <p style="margin: 10px 0; opacity: 0.9;">Password Reset</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #374151; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password for your DreamHire account. Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          <strong>Important:</strong>
          <br>· This link will expire in <strong>15 minutes</strong>
          <br>· If you didn't request this password reset, Please ignore this email
          <br>· For security reasons, never share this link with anyone
        </p>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <span style="word-break: break-all; color: #667eea;">${resetLink}</span>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
        <p>This is an automated message from DreamHire. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  console.log("Sending password reset email with link:", resetLink);
  const result = await sendEmail(email, subject, text, htmlContent);
  console.log("Password reset email sent result:", result);
  return result;
};

// Store OTP with expiration
export const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email, { otp, expiresAt, lastSent: Date.now() });
  console.log('OTP stored for email:', email);
};

// Store password reset token
export const storePasswordResetToken = (email, token) => {
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  passwordResetStore.set(email, { token, expiresAt });
  console.log('Password reset token stored for email:', email);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it from store
  otpStore.delete(email);
  console.log('OTP verified successfully for email:', email);
  return { valid: true, message: 'OTP verified successfully' };
};

// Verify password reset token
export const verifyPasswordResetToken = (email, token) => {
  const storedData = passwordResetStore.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'Invalid or expired reset token' };
  }
  
  if (Date.now() > storedData.expiresAt) {
    passwordResetStore.delete(email);
    return { valid: false, message: 'Reset token expired' };
  }
  
  if (storedData.token !== token) {
    return { valid: false, message: 'Invalid reset token' };
  }
  
  console.log('Password reset token verified successfully for email:', email);
  return { valid: true, message: 'Reset token verified successfully' };
};

// Clear password reset token after use
export const clearPasswordResetToken = (email) => {
  passwordResetStore.delete(email);
  console.log('Password reset token cleared for email:', email);
};

// Check cooldown (prevent spam)
export const canSendOTP = (email) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { canSend: true, message: 'Ready to send OTP' };
  }
  
  const cooldownPeriod = 30 * 1000; // 30 seconds cooldown
  const timeSinceLastSent = Date.now() - storedData.lastSent;
  
  if (timeSinceLastSent < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSent) / 1000);
    return { 
      canSend: false, 
      message: `Please wait ${remainingTime} seconds before requesting another OTP` 
    };
  }
  
  return { canSend: true, message: 'Ready to send OTP' };
};

// Clean up expired OTPs and reset tokens (run periodically)
export const cleanupExpiredData = () => {
  const now = Date.now();
  
  // Clean up expired OTPs
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
  
  // Clean up expired reset tokens
  for (const [email, data] of passwordResetStore.entries()) {
    if (now > data.expiresAt) {
      passwordResetStore.delete(email);
    }
  }
};

// Auto-cleanup every 5 minutes
setInterval(cleanupExpiredData, 5 * 60 * 1000);
