import dotenv from "dotenv";
dotenv.config({ override: true });
import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/user.model.js";
import ResumeAnalysis from "./models/resumeAnalysis.model.js";
import connectDB from "./config/db.config.js";

const PORT = 5001;

const runApiTests = async () => {
  let server;
  try {
    console.log("=== Running Resume Intelligence Module API Integration Tests ===");
    
    // Connect to DB
    await connectDB();
    
    // Clean database before starting
    await User.deleteMany({ email: "test-dev@example.com" });
    await ResumeAnalysis.deleteMany({});
    console.log("Cleaned up existing test users and analyses from database.");

    // Start server
    server = app.listen(PORT, () => {
      console.log(`Test server listening on port ${PORT}`);
    });

    const baseUrl = `http://localhost:${PORT}/api`;
    
    // 1. Register User
    console.log("\n1. Testing User Registration (POST /api/auth/register)...");
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Developer",
        email: "test-dev@example.com",
        password: "securepassword123",
        targetRole: "Full-Stack Developer"
      })
    });
    
        const regData = await regRes.json();
    console.log("Status:", regRes.status);
    
    if (regRes.status !== 201 || (!regData.token && !regData.data?.accessToken)) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    
    const token = regData.token || regData.data?.accessToken;
    console.log("Successfully registered! Token acquired.");

    // 2. Login User
    console.log("\n2. Testing User Login (POST /api/auth/login)...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test-dev@example.com",
        password: "securepassword123"
      })
    });
    
    const loginData = await loginRes.json();
    console.log("Status:", loginRes.status);
    
    if (loginRes.status !== 200 || (!loginData.token && !loginData.data?.accessToken)) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    console.log("Successfully logged in!");

    // 3. Upload Resume as Text
    console.log("\n3. Testing Resume Upload / Analysis (POST /api/resume/upload)...");
    const resumeText = `
    Jane Smith
    jane.smith@example.com
    555-555-5555
    linkedin.com/in/janesmith

    Skills
    React, Node.js, Express, MongoDB, JavaScript, Git, Docker, REST APIs

    Experience
    Full-Stack Intern at CodeCorp (2025 - Present)
    - Built web apps using React and Node.js.

    Education
    Computer Science student at Tech College
    `;
    
    const uploadRes = await fetch(`${baseUrl}/resume/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        resumeText,
        targetRole: "Full-Stack Developer"
      })
    });
    
    const uploadData = await uploadRes.json();
    console.log("Status:", uploadRes.status);
    console.log("Upload Response Payload:", JSON.stringify(uploadData, null, 2));
    
    if (uploadRes.status !== 201 || !uploadData.success) {
      throw new Error(`Resume upload/analysis failed: ${JSON.stringify(uploadData)}`);
    }
    
    console.log("Resume uploaded and analyzed successfully!");
    
    // Verify user profile update in Database
    const updatedUser = await User.findOne({ email: "test-dev@example.com" });
    console.log("Updated User resumeData inside DB:", JSON.stringify(updatedUser.resumeData, null, 2));
    if (!updatedUser.resumeData || updatedUser.resumeData.strengthScore === 0) {
      throw new Error("User model was not updated with the resume analysis score!");
    }

    // 4. Retrieve Resume History
    console.log("\n4. Testing Retrieve Resume History (GET /api/resume/history)...");
    const historyRes = await fetch(`${baseUrl}/resume/history`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const historyData = await historyRes.json();
    console.log("Status:", historyRes.status);
    console.log("History records count:", historyData.count);
    console.log("First history record sample:", JSON.stringify(historyData.data?.[0], null, 2));
    
    if (historyRes.status !== 200 || !historyData.success || historyData.count === 0) {
      throw new Error(`Retrieve history failed: ${JSON.stringify(historyData)}`);
    }

    console.log("\n=== ALL API TESTS PASSED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("\nTEST RUN FAILED:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    // Cleanup Mongoose and server
    if (server) {
      server.close();
      console.log("HTTP server closed.");
    }
    await mongoose.connection.close();
    console.log("Mongoose connection closed.");
    process.exit();
  }
};

runApiTests();
