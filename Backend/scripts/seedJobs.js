import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";

// Sample companies
const sampleCompanies = [
  {
    name: "Google",
    description: "Leading technology company specializing in internet services and products",
    website: "https://www.google.com",
    location: "Mountain View, CA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
  },
  {
    name: "Microsoft",
    description: "Multinational technology corporation developing software and services",
    website: "https://www.microsoft.com",
    location: "Redmond, WA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
  },
  {
    name: "Amazon",
    description: "E-commerce and cloud computing giant",
    website: "https://www.amazon.com",
    location: "Seattle, WA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
  },
  {
    name: "Meta",
    description: "Social media and technology company",
    website: "https://www.meta.com",
    location: "Menlo Park, CA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
  },
  {
    name: "Apple",
    description: "Technology company designing consumer electronics and software",
    website: "https://www.apple.com",
    location: "Cupertino, CA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
  }
];

// Sample jobs
const sampleJobs = [
  {
    title: "Frontend Developer",
    description: "We are seeking a talented Frontend Developer to join our team at Google. In this role, you will be responsible for building responsive, user-friendly web applications using React, JavaScript, HTML5, and CSS3. You will collaborate with UX designers and backend engineers to create seamless user experiences, optimize applications for maximum speed and scalability, and implement modern design principles.",
    requirements: ["React", "JavaScript", "HTML5", "CSS3", "Responsive Design"],
    salary: "50000",
    experienceLevel: 3,
    location: "Hyderabad",
    jobType: "Full Time",
    position: 6
  },
  {
    title: "Backend Developer",
    description: "Amazon is looking for a skilled Backend Developer to design, develop, and maintain scalable server-side applications. You will work with Node.js, Express, and various databases to build robust APIs that power our e-commerce platform. Responsibilities include developing microservices, implementing authentication and authorization, optimizing database performance, and ensuring system security.",
    requirements: ["Node.js", "Express", "MongoDB", "REST APIs", "Cloud Services"],
    salary: "60000",
    experienceLevel: 4,
    location: "Bangalore",
    jobType: "Full Time",
    position: 8
  },
  {
    title: "Full Stack Developer",
    description: "Microsoft is seeking an exceptional Full Stack Developer to work on our cloud-based applications. This role requires expertise in the entire MERN stack - MongoDB, Express.js, React, and Node.js. You will be responsible for developing end-to-end web applications, from database design to frontend implementation.",
    requirements: ["MERN Stack", "React", "Node.js", "MongoDB", "Cloud Platforms"],
    salary: "70000",
    experienceLevel: 5,
    location: "Chennai",
    jobType: "Full Time",
    position: 1
  },
  {
    title: "Mobile App Developer",
    description: "Meta is seeking talented Mobile App Developers to create engaging mobile experiences for millions of users. You will work with React Native to build cross-platform mobile applications for iOS and Android. Responsibilities include developing mobile features, optimizing app performance, integrating with backend APIs.",
    requirements: ["React Native", "Mobile UI/UX", "iOS", "Android", "Performance Optimization"],
    salary: "65000",
    experienceLevel: 3,
    location: "Mumbai",
    jobType: "Full Time",
    position: 5
  },
  {
    title: "iOS Developer",
    description: "Apple is seeking talented iOS Developers to create innovative applications for iPhone and iPad that delight millions of users worldwide. In this mobile development role, you will work with Swift, UIKit, and iOS frameworks to build high-quality, performant mobile applications.",
    requirements: ["Swift", "UIKit", "iOS Frameworks", "Mobile App Design", "App Store Guidelines"],
    salary: "65000",
    experienceLevel: 4,
    location: "Bangalore",
    jobType: "Full Time",
    position: 5
  }
];

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || "mongodb+srv://pavan:PavanAdhitya@cluster0.vdmug3z.mongodb.net/jobportal");
    console.log("✅ Connected to MongoDB for seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Clear existing data
    await Job.deleteMany({});
    await Company.deleteMany({});
    await User.deleteMany({});
    console.log("🧹 Cleared existing data");
    
    // Create sample user
    const sampleUser = await User.create({
      fullname: "Admin User",
      email: "admin@dreamhire.com",
      phoneNumber: "9876543210",
      password: "$2a$10$dummyhashedpassword", // Dummy hash
      pancard: "ABCDE1234F",
      adharcard: "123456789012",
      role: "Recruiter",
      isEmailVerified: true
    });
    console.log("👤 Created sample user");
    
    // Insert companies with userId
    const companies = sampleCompanies.map(company => ({
      ...company,
      userId: sampleUser._id
    }));
    
    const insertedCompanies = await Company.insertMany(companies);
    console.log(`🏢 Inserted ${insertedCompanies.length} companies`);
    
    // Insert jobs with company references
    const jobsWithCompanies = sampleJobs.map((job, index) => ({
      ...job,
      company: insertedCompanies[index % insertedCompanies.length]._id,
      created_by: sampleUser._id // Use sample user as creator
    }));
    
    const jobs = await Job.insertMany(jobsWithCompanies);
    console.log(`💼 Inserted ${jobs.length} jobs`);
    
    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

// Run seeding
const runSeeding = async () => {
  await connectDB();
  await seedData();
};

runSeeding();
