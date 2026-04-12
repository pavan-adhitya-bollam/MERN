// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import authRoute from "./routes/otp.route.js";
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins in development
    const allowedOrigins = [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://127.0.0.1:60873",
      "http://172.27.240.1:5173", 
      "http://172.27.240.1:5174",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ];
    
    // Add production frontend URL if configured
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};

app.use(cors(corsOptions));

// Serve static files from uploads folder
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5001;

 
//api's

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DreamHire Backend API is running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      testEmail: "/api/test-email",
      auth: "/api/auth",
      user: "/api/user"
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Quick email config test
app.get("/api/email-config", (req, res) => {
  res.status(200).json({
    success: true,
    config: {
      EMAIL_USER: process.env.EMAIL_USER ? "configured" : "missing",
      EMAIL_PASS: process.env.EMAIL_PASS ? "configured" : "missing",
      MONGO_URL: process.env.MONGO_URL ? "configured" : "missing",
      JWT_SECRET: process.env.JWT_SECRET ? "configured" : "missing",
      NODE_ENV: process.env.NODE_ENV || "development"
    }
  });
});

// Quick email verification test (instant)
app.get("/api/email-test", (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    
    if (!emailUser || !sendgridKey) {
      return res.status(400).json({
        success: false,
        message: "Email credentials not configured"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Email service is configured and ready",
      email: emailUser,
      status: "Ready to send emails",
      note: "Use /api/auth/send-otp for actual email testing"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Configuration error"
    });
  }
});

// Detailed email debugging endpoint
app.get("/api/email-debug", async (req, res) => {
  try {
    // Import and create transporter directly
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false
      },
      // Force IPv4
      family: 4
    });
    
    // Test transporter connection
    await transporter.verify();
    
    return res.status(200).json({
      success: true,
      message: "Gmail SMTP connection verified successfully",
      email: process.env.EMAIL_USER,
      smtp: "Connected (IPv4)"
    });
  } catch (error) {
    console.error("Email debug error:", error);
    return res.status(500).json({
      success: false,
      message: "Gmail SMTP connection failed - Render IPv6 issue",
      error: error.message,
      email: process.env.EMAIL_USER,
      renderIssue: true,
      suggestions: [
        "This is a known Render free tier IPv6 issue",
        "Upgrade to Render Starter plan ($7/month) to fix",
        "Or use alternative email service like SendGrid",
        "Emails work but are slow on free tier"
      ]
    });
  }
});

// Test email route (async)
app.get("/api/test-email", async (req, res) => {
  try {
    const { sendOTPEmail } = await import('./services/otpService.js');
    
    // Send test email to the configured EMAIL_USER
    const testEmail = process.env.EMAIL_USER;
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: "EMAIL_USER not configured"
      });
    }
    
    const testOTP = "123456"; // Fixed test OTP
    
    // Set timeout for email sending
    const emailPromise = sendOTPEmail(testEmail, testOTP);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 15000)
    );
    
    const emailSent = await Promise.race([emailPromise, timeoutPromise]);
    
    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        testOTP: testOTP
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send test email"
      });
    }
  } catch (error) {
    console.error("ERROR in test email:", error);
    if (error.message === 'Email timeout') {
      return res.status(408).json({
        success: false,
        message: "Email sending timeout - Gmail SMTP slow on Render free tier"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
