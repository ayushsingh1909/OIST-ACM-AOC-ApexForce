import dotenv from "dotenv";
dotenv.config({ override: true });
import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/user.model.js";
import Assignment from "./models/assignment.model.js";
import connectDB from "./config/db.config.js";

const PORT = 5002;

const runAssignmentTests = async () => {
  let server;
  try {
    console.log("=== Running Adaptive Assignment Engine API Integration Tests ===");
    
    // Connect to DB
    await connectDB();
    
    // Cleanup existing test user and assignments
    await User.deleteMany({ email: "test-assignment-dev@example.com" });
    await Assignment.deleteMany({});
    console.log("Cleaned database.");

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
        name: "Assignment Developer",
        email: "test-assignment-dev@example.com",
        password: "securepassword123",
        targetRole: "Full-Stack Developer"
      })
    });
    
    const regData = await regRes.json();
    console.log("Reg Status:", regRes.status);
    if (regRes.status !== 201 || !regData.data?.accessToken) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    const token = regData.data.accessToken;

    // 2. Generate Assignment
    console.log("\n2. Testing Assignment Generation (POST /api/assignments/generate)...");
    const genRes = await fetch(`${baseUrl}/assignments/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        topicName: "React Hooks",
        assignmentType: "Coding",
        difficulty: "Medium"
      })
    });

    const genData = await genRes.json();
    console.log("Gen Status:", genRes.status);
    console.log("Generated Title:", genData.data?.title);
    if (genRes.status !== 201 || !genData.success) {
      throw new Error(`Assignment generation failed: ${JSON.stringify(genData)}`);
    }
    const assignmentId = genData.data._id;

    // 3. Submit Assignment
    console.log("\n3. Testing Assignment Submission & AI Evaluation (POST /api/assignments/:id/submit)...");
    
    // A clean code submission containing caching and loading state checks, but missing unmount cleanup
    const submissionContent = `
      import { useState, useEffect } from 'react';
      
      const cache = new Map();
      
      export const useFetch = (url) => {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        
        useEffect(() => {
          if (cache.has(url)) {
            setData(cache.get(url));
            setLoading(false);
            return;
          }
          
          setLoading(true);
          fetch(url)
            .then(res => res.json())
            .then(data => {
              cache.set(url, data);
              setData(data);
              setLoading(false);
            })
            .catch(err => {
              setError(err);
              setLoading(false);
            });
        }, [url]);
        
        return { data, loading, error };
      };
    `;

    const subRes = await fetch(`${baseUrl}/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        submissionMode: "Code",
        content: submissionContent,
        githubLink: "https://github.com/test-user/react-hooks-fetching"
      })
    });

    const subData = await subRes.json();
    console.log("Sub Status:", subRes.status);
    console.log("Evaluation Results:", JSON.stringify(subData.data, null, 2));

    if (subRes.status !== 200 || !subData.success) {
      throw new Error(`Submission failed: ${JSON.stringify(subData)}`);
    }

    // Verify evaluation score: baseline 60 + 3*10 (concepts covered) + 5 (github link) = 95
    if (subData.data.evaluation.score !== 95) {
      throw new Error(`Evaluation score mismatch! Expected 95 but got ${subData.data.evaluation.score}`);
    }
    console.log("Evaluation score validation matches exactly: 95!");

    // Verify Topic Mastery Calculation:
    // Attempts: 1
    // quizAccuracy default: 75
    // Topic Mastery = (Quiz Score * 0.50) + (Assignment Score * 0.30) + (Consistency * 0.20)
    // Consistency = min(100, 1 * 25) = 25
    // Mastery = (75 * 0.5) + (95 * 0.3) + (25 * 0.2) = 37.5 + 28.5 + 5 = 71
    if (subData.data.masteryUpdate.newMasteryScore !== 71) {
      throw new Error(`Topic mastery calculation mismatch! Expected 71 but got ${subData.data.masteryUpdate.newMasteryScore}`);
    }
    console.log("Topic mastery validation matches formula exactly: 71!");

    // 4. Retrieve History
    console.log("\n4. Testing Retrieve Assignments History (GET /api/assignments)...");
    const historyRes = await fetch(`${baseUrl}/assignments`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const historyData = await historyRes.json();
    console.log("History Status:", historyRes.status);
    console.log("History Count:", historyData.count);
    if (historyRes.status !== 200 || historyData.count === 0) {
      throw new Error(`Retrieve history failed: ${JSON.stringify(historyData)}`);
    }

    console.log("\n=== ALL ADAPTIVE ASSIGNMENT TESTS PASSED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("\nTEST RUN FAILED:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
      console.log("HTTP server closed.");
    }
    await mongoose.connection.close();
    console.log("Mongoose connection closed.");
    process.exit();
  }
};

runAssignmentTests();
