import { Job } from "../models/job.model.js";

//Admin job posting
export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experienceLevel ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements,
      salary: salary.toString(),
      experienceLevel,
      location,
      jobType,
      position: Number(position),
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "New job created successfully",
      job,
      success: true,
    });
  } catch (error) {
    console.error("Post job error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    console.log("=== GET ALL JOBS DEBUG ===");
    console.log("Fetching jobs from MongoDB...");
    
    const keyword = req.query.keyword || "";
    console.log("Search keyword:", keyword);

    let jobs = await Job.find({}).populate("company").populate("created_by");
    console.log("Found jobs in MongoDB:", jobs.length);

    if (keyword) {
      console.log("Filtering jobs with keyword:", keyword);
      jobs = jobs.filter((job) => {
        const searchTerm = keyword.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm) ||
          job.jobType.toLowerCase().includes(searchTerm)
        );
      });
      console.log("Filtered jobs count:", jobs.length);
    }

    if (!jobs || jobs.length === 0) {
      console.log("No jobs found, returning empty array");
      return res.status(200).json({
        jobs: [],
        success: true,
      });
    }

    console.log("Returning", jobs.length, "jobs");
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("=== GET JOB BY ID DEBUG ===");
    console.log("Job ID from params:", jobId);
    console.log("==========================");

    // Find job by ID and populate company details
    const job = await Job.findById(jobId).populate("company");

    if (!job) {
      console.log("Job not found in database for ID:", jobId);
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    console.log("Job found successfully:", job.title);
    return res.status(200).json({
      job,
      success: true,
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get admin jobs
export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId })
      .populate({
        path: "company",
        sort: { createdAt: -1 },
      })
      .populate({
        path: "created_by",
        sort: { createdAt: -1 },
      });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        message: "Jobs not found",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("Get admin jobs error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
