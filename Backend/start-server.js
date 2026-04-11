// Simple server startup script to avoid PowerShell parsing issues
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5001;

// Basic middleware
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

// Routes
const userRoute = require('./routes/user.route.js');
const companyRoute = require('./routes/company.route.js');
const jobRoute = require('./routes/job.route.js');
const applicationRoute = require('./routes/application.route.js');
const authRoute = require('./routes/otp.route.js');

app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/auth", authRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Server started successfully!');
});
