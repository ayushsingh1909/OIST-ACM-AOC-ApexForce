import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/user.model.js";
import InterviewQuestion from "./models/interviewQuestion.model.js";
import InterviewSession from "./models/interviewSession.model.js";
import connectDB from "./config/db.config.js";
import { seedQuestions } from "./services/questionBank.service.js";

const PORT = 5002;

const runTests = async () => {
  let server;
  try {
    console.log("=== Running Interview Simulation Module API Integration Tests ===");
    
    // Connect to DB
    await connectDB();
    
    // Seed questions
    await seedQuestions();
    
    // Clean database before starting
    await User.deleteMany({ email: "test-interview@example.com" });
    await InterviewSession.deleteMany({});
    console.log("Cleaned up existing test users and interview sessions from database.");

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
        name: "Test Interviewee",
        email: "test-interview@example.com",
        password: "securepassword123",
        role: "student"
      })
    });
    
    const regData = await regRes.json();
    console.log("Status:", regRes.status);
    
    if (regRes.status !== 201 || (!regData.token && !regData.data?.accessToken)) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    
    const token = regData.token || regData.data?.accessToken;
    console.log("Successfully registered! Token acquired.");

    // 2. Fetch Roles Configuration
    console.log("\n2. Testing Get Roles (GET /api/interview/roles)...");
    const rolesRes = await fetch(`${baseUrl}/interview/roles`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const rolesData = await rolesRes.json();
    console.log("Status:", rolesRes.status);
    if (rolesRes.status !== 200 || !rolesData.success) {
      throw new Error(`Get roles failed: ${JSON.stringify(rolesData)}`);
    }
    console.log("Available roles:", Object.keys(rolesData.data));

    // 3. Start Interview Session
    console.log("\n3. Testing Start Session (POST /api/interview/start)...");
    const startRes = await fetch(`${baseUrl}/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        role: "Full-Stack Developer",
        skillStack: ["React", "Node.js", "MongoDB"],
        difficulty: "Medium",
        timeLimitPerQuestion: 120
      })
    });
    const startData = await startRes.json();
    console.log("Status:", startRes.status);
    if (startRes.status !== 201 || !startData.success) {
      throw new Error(`Start session failed: ${JSON.stringify(startData)}`);
    }
    
    const sessionId = startData.data.sessionId;
    console.log(`Successfully started session! SessionID: ${sessionId}`);
    console.log(`Loaded ${startData.data.questions.length} questions.`);
    
    // Verify security: questions do not leak evaluation/ideal keywords
    const firstQ = startData.data.questions[0];
    if (firstQ.idealKeywords || firstQ.sampleAnswer || firstQ.score) {
      throw new Error("Security check failed: questions leaked answer evaluation details in active phase!");
    }
    console.log("Security verification passed: Question metadata is masked.");

    // 4. Submit Answers for all questions
    console.log("\n4. Testing Answer Submissions (POST /api/interview/session/:id/answer)...");
    const sampleAnswers = [
      "React Virtual DOM is an in-memory representation of real DOM components. When changes happen, React diffs the old virtual tree with the new virtual tree. Using Fiber reconciliation, it schedules and updates the changes to the real DOM with key props, achieving O(n) performance.",
      "The Cache-Aside strategy involves checking the cache (Redis) first. On a hit, return. On a miss, read from the database, write back to Redis, and return. To prevent invalidation issues we delete cache key on updates. To mitigate cache stampede we use mutex locking, and Bloom Filters for cache penetration.",
      "To optimize the query, I would run EXPLAIN ANALYZE to review the SQL execution plan and look for table scans. I will create indexes on JOIN and WHERE conditions. I will fix N+1 queries by replacing loops with eager loading or JOINs, specify columns in SELECT, and use Redis connection pooling.",
      "I was in a project where a team member and I had a conflict choosing between SQL and NoSQL. I set up a design meeting to actively listen to constraints. We compared requirements, compromised on PostgreSQL with JSONB columns for document data, and achieved consensus and alignment."
    ];

    for (let i = 0; i < startData.data.questions.length; i++) {
      const q = startData.data.questions[i];
      console.log(`\nSubmitting answer for question ${i + 1} (${q.vertical}): "${q.questionText.substring(0, 50)}..."`);
      const ansRes = await fetch(`${baseUrl}/interview/session/${sessionId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          answerText: sampleAnswers[i],
          timeSpent: 30
        })
      });
      const ansData = await ansRes.json();
      console.log("Status:", ansRes.status);
      if (ansRes.status !== 200 || !ansData.success) {
        throw new Error(`Submit answer failed on question ${i+1}: ${JSON.stringify(ansData)}`);
      }
      console.log(`Score achieved: ${ansData.data.score}/100`);
      console.log(`Feedback snippet: ${ansData.data.evaluation.feedback.substring(0, 80)}...`);
    }

    // 5. Complete Session
    console.log("\n5. Testing Complete Session (POST /api/interview/session/:id/complete)...");
    const compRes = await fetch(`${baseUrl}/interview/session/${sessionId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const compData = await compRes.json();
    console.log("Status:", compRes.status);
    if (compRes.status !== 200 || !compData.success) {
      throw new Error(`Complete session failed: ${JSON.stringify(compData)}`);
    }
    
    console.log(`Overall Session Score: ${compData.data.overallScore}/100`);
    console.log(`Missing Concepts Detected: ${compData.data.missingConceptsBreakdown.join(", ")}`);
    console.log(`Overall Feedback: ${compData.data.overallFeedback}`);

    // 6. Retrieve History
    console.log("\n6. Testing Retrieve History (GET /api/interview/history)...");
    const histRes = await fetch(`${baseUrl}/interview/history`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const histData = await histRes.json();
    console.log("Status:", histRes.status);
    if (histRes.status !== 200 || !histData.success || histData.count === 0) {
      throw new Error(`Retrieve history failed: ${JSON.stringify(histData)}`);
    }
    console.log(`Records fetched: ${histData.count}. Latest session ID: ${histData.data[0]._id}`);

    console.log("\n=== ALL INTERVIEW ENGINE TESTS PASSED SUCCESSFULLY! ===");
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

runTests();
