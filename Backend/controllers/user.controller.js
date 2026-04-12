import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { sendOTPEmail } from "../services/otpService.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, adharcard, pancard, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role || !pancard || !adharcard) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
      });
    }

    const existingAdharcard = await User.findOne({ adharcard });
    if (existingAdharcard) {
      return res.status(400).json({
        message: "Adhar number already exists",
        success: false,
      });
    }

    const existingPancard = await User.findOne({ pancard });
    if (existingPancard) {
      return res.status(400).json({
        message: "Pan number already exists",
        success: false,
      });
    }

    const file = req.file;
    let profilePhotoUrl = "https://via.placeholder.com/150"; // default
    
    if (file) {
      console.log("File received:", file);
      // If it's an image file, use it as profile photo
      if (file.mimetype.startsWith('image/')) {
        profilePhotoUrl = `/uploads/${file.filename}`;
      }
    } else {
      console.log("No file received, using default profile photo");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      adharcard,
      pancard,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl, // Use the uploaded file URL or default
      },
    });

    await newUser.save();

    return res.status(201).json({
      message: `Account created successfully for ${fullname}`,
      success: true,
    });
  } catch (error) {
    console.error("ERROR in register:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      fullname,
      email,
      phoneNumber,
      role
    });
    return res.status(500).json({
      message: "Server Error registering user",
      success: false,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log('Login request received:', req.body);
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role });
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    console.log('Finding user for email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    console.log('User found:', {
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      passwordHashLength: user.password?.length
    });

    console.log('Comparing passwords...');
    console.log('Input password length:', password.length);
    console.log('Stored password hash:', user.password.substring(0, 20) + '...');
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      console.log('Role mismatch. User role:', user.role, 'Requested role:', role);
      return res.status(403).json({
        message: "Invalid role",
        success: false,
      });
    }

    console.log('Generating JWT token...');
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful for:', email);
    console.log("==================");

    return res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
      token
    });
  } catch (error) {
    console.error("ERROR in login:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      role: req.body?.role
    });
    return res.status(500).json({
      message: "Login failed",
      success: false,
    });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token');
    
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("ERROR in logout:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      message: "Logout failed",
      success: false,
    });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    
    console.log("=== PROFILE UPDATE DEBUG ===");
    console.log("User ID:", userId);
    console.log("Request body:", { fullname, email, phoneNumber, bio, skills });
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    console.log("Current user:", user.email);
    console.log("New email:", email);
    console.log("Email comparison:", email !== user.email);

    // Update basic fields
    if (fullname) user.fullname = fullname;
    if (email && email !== user.email) {
      // Check if new email already exists (exclude current user)
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: userId } // Exclude current user
      });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
          success: false,
        });
      }
      user.email = email;
    }
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Update profile fields
    if (bio !== undefined) user.profile.bio = bio;
    if (skills) {
      // Handle skills - if it's a string, split by comma; if array, use as is
      const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
      user.profile.skills = skillsArray;
    }
    
    // Update profile photo if file was uploaded
    if (req.file) {
      user.profile.profilePhoto = `/uploads/${req.file.filename}`;
      user.profile.profilePhotoOriginalname = req.file.originalname;
      console.log("Profile photo updated:", user.profile.profilePhoto);
    } else {
      console.log("No new file uploaded, preserving existing profile photo:", user.profile.profilePhoto);
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({
      message: "Server error during profile update",
      success: false,
    });
  }
};

// ================= SEND OTP =================
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    console.log("=== OTP SEND DEBUG ===");
    console.log("Checking email:", email);
    console.log("Database connection:", mongoose.connection.name);
    
    // Check if email already exists and is verified - ONLY DATABASE CHECK
    const existingUser = await User.findOne({ email, isEmailVerified: true });
    console.log("Existing verified user found:", existingUser ? existingUser.email : "None");
    
    if (existingUser) {
      console.log("Email already registered and verified:", email);
      return res.status(400).json({
        message: "Email is already registered and verified",
        success: false,
      });
    }

    // Generate and send OTP via email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    console.log("Generated OTP:", otp, "for email:", email);
    
    // Send OTP via SendGrid
    const emailSent = await sendOTPEmail(email, otp);
    console.log("OTP email sent result:", emailSent);
    
    if (!emailSent) {
      console.log("Email sending failed - returning error response");
      return res.status(500).json({
        message: "Failed to send OTP to email. Please check SendGrid configuration.",
        success: false,
        error: "Email service unavailable"
      });
    }
    
    const otpData = { otp, expiresAt };

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create temporary user record with OTP
      user = new User({
        email,
        emailVerificationOTP: otpData.otp,
        emailVerificationExpires: otpData.expiresAt,
        isEmailVerified: false,
        fullname: 'temp', // Temporary values
        phoneNumber: 'temp',
        password: 'temp', // Will be updated later
        adharcard: 'temp',
        pancard: 'temp',
        role: 'Student',
      });
    } else {
      // Update existing user's OTP
      user.emailVerificationOTP = otpData.otp;
      user.emailVerificationExpires = otpData.expiresAt;
    }
    
    await user.save();

    console.log(`OTP sent to ${email}: ${otpData.otp}`);

    // Check if email is configured to determine response
    const isEmailConfigured = process.env.EMAIL_USER && 
                              process.env.EMAIL_PASS && 
                              process.env.EMAIL_USER !== 'your-gmail-address@gmail.com' && 
                              process.env.EMAIL_PASS !== 'your-16-character-app-password';

    if (isEmailConfigured) {
      return res.status(200).json({
        message: "OTP sent to your email address",
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "OTP sent to your email (Test Mode - check console)",
        success: true,
        testOTP: otpData.otp, // Include OTP for testing
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
  }
};

// ================= VERIFY OTP =================
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if OTP is valid and not expired
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        message: "OTP has expired",
        success: false,
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP",
      success: false,
    });
  }
};

// ================= COMPLETE REGISTRATION =================
export const completeRegistration = async (req, res) => {
  try {
    console.log("=== COMPLETE REGISTRATION DEBUG ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers);
    console.log("=====================================");
    
    const { email, fullname, phoneNumber, password, adharcard, pancard, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role || !pancard || !adharcard) {
      console.log("Missing required fields:", { 
        fullname: !!fullname, 
        email: !!email, 
        phoneNumber: !!phoneNumber, 
        password: !!password, 
        role: !!role, 
        pancard: !!pancard, 
        adharcard: !!adharcard 
      });
      return res.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    const file = req.file;
    let profilePhotoUrl = "https://via.placeholder.com/150";
    
    // Skip file upload on Render for now - make profile photo optional
    if (file && file.mimetype.startsWith('image/')) {
      console.log("File upload skipped - profile photo is optional for now");
      profilePhotoUrl = null; // Skip file upload to avoid Render issues
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");
    
    // Check if user already exists and is fully registered
    const existingUser = await User.findOne({ email });
    console.log("Existing user check:", {
      email,
      exists: !!existingUser,
      isEmailVerified: existingUser?.isEmailVerified,
      hasPassword: !!existingUser?.password
    });
    
    if (existingUser && existingUser.isEmailVerified === true) {
      console.log("Fully registered user already exists:", email);
      return res.status(400).json({
        message: "Email already registered. Please use a different email or try logging in.",
        success: false,
      });
    }
    
    // Handle existing user that is not fully registered (OTP verified but not completed)
    if (existingUser && existingUser.isEmailVerified === false) {
      console.log("Updating existing unverified user:", email);
      // Update existing user with complete registration details
      existingUser.fullname = fullname;
      existingUser.phoneNumber = phoneNumber;
      existingUser.adharcard = adharcard;
      existingUser.pancard = pancard;
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.profile = {
        profilePhoto: profilePhotoUrl,
      };
      existingUser.isEmailVerified = true;
      
      console.log("Saving updated user to database...");
      await existingUser.save();
      console.log("User updated successfully:", existingUser.email);

      return res.status(201).json({
        message: `Registration completed successfully for ${fullname}`,
        success: true,
      });
    }
    
    // Create new user
    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      adharcard,
      pancard,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
      },
      isEmailVerified: true,
    });

    console.log("Saving user to database...");
    await newUser.save();
    console.log("User saved successfully:", newUser.email);

    return res.status(201).json({
      message: `Registration completed successfully for ${fullname}`,
      success: true,
    });
  } catch (error) {
    console.error("Complete registration error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      code: error.code
    });
    return res.status(500).json({
      message: "Server Error completing registration",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};