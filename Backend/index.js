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
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://127.0.0.1:60873",
    "http://172.27.240.1:5173", 
    "http://172.27.240.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};

app.use(cors(corsOptions));

// Serve static files from uploads folder
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5001;

 
//api's

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Test email route
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
    const emailSent = await sendOTPEmail(testEmail, testOTP);
    
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
