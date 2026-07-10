import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
import User from "./models/user.model.js";
import InterviewSession from "./models/interviewSession.model.js";
import connectDB from "./config/db.config.js";

const PORT = 5003;

const runInterviewTests = async () => {
  let server;
  try {
    console.log("=== Running Interview Simulation Engine API Integration Tests ===");

    // Connect to DB
    await connectDB();

    // Cleanup existing data
    await User.deleteMany({ email: "test-interview-dev@example.com" });
    await InterviewSession.deleteMany({});
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
        name: "Interview Candidate",
        email: "test-interview-dev@example.com",
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

    // 2. Start Interview Session
    console.log("\n2. Testing Interview Init (POST /api/interviews/start)...");
    const startRes = await fetch(`${baseUrl}/interviews/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        targetRole: "Full-Stack Developer",
        skillStack: ["React", "Node.js"]
      })
    });

    const startData = await startRes.json();
    console.log("Start Status:", startRes.status);
    console.log("Session ID:", startData.data?._id);
    console.log("Questions Selected Count:", startData.data?.questions?.length);
    if (startRes.status !== 201 || startData.data?.questions?.length !== 4) {
      throw new Error(`Interview init failed: ${JSON.stringify(startData)}`);
    }
    const sessionId = startData.data._id;
    const questions = startData.data.questions;

    // 3. Submit Answers for all 4 questions sequentially (optimizing latency)
    console.log("\n3. Submitting Answers (POST /api/interviews/:id/submit)...");

    // Answers containing transitional phrases and keywords
    const answersPool = [
      "Firstly, the virtual DOM is a lightweight representation in memory. React compares it with the previous tree which is called diffing. For example, key props help reconciliation identify changed components.",
      "Secondly, the Node.js event loop handles I/O using libuv. It is non-blocking. To prevent bottlenecks, worker threads handle CPU bound tasks in polling phase.",
      "Thirdly, I disagree with stakeholders respectfully. However, we communicate and align using data-driven objective criteria to reach compromise.",
      "Finally, we design a rate limiter middleware using Redis for token buckets. To prevent spikes, sliding window log checks IP headers for throttling."
    ];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = answersPool[i];

      console.log(`\nSubmitting Answer for Q${i + 1} (${q.category}):`);
      const startTime = Date.now();

      const submitRes = await fetch(`${baseUrl}/interviews/${sessionId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: q._id,
          answerText: answer
        })
      });

      const submitData = await submitRes.json();
      const duration = Date.now() - startTime;

      console.log(`Grade: ${submitData.data?.lastEvaluation?.score} | Duration: ${duration}ms`);
      if (submitRes.status !== 200) {
        throw new Error(`Submission failed at Q${i + 1}: ${JSON.stringify(submitData)}`);
      }

      // Assert under 3 seconds
      if (duration > 3000) {
        throw new Error(`Latency SLA breached! Submission took ${duration}ms`);
      }

      if (i === questions.length - 1) {
        // Assert session completed
        if (submitData.data.status !== "completed") {
          throw new Error("Expected session status to change to completed");
        }
        console.log("Overall Score Calculated:", submitData.data.overallScore);
        console.log("Overall Feedback:", submitData.data.feedback);
      }
    }

    // 4. Retrieve History
    console.log("\n4. Testing Retrieve History (GET /api/interviews/history)...");
    const histRes = await fetch(`${baseUrl}/interviews/history`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const histData = await histRes.json();
    console.log("History Status:", histRes.status);
    console.log("History Count:", histData.count);
    if (histRes.status !== 200 || histData.count !== 1) {
      throw new Error(`History fetch failed: ${JSON.stringify(histData)}`);
    }

    // 5. Retrieve Report
    console.log("\n5. Testing Retrieve Report (GET /api/interviews/:id/report)...");
    const reportRes = await fetch(`${baseUrl}/interviews/${sessionId}/report`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const reportData = await reportRes.json();
    console.log("Report Status:", reportRes.status);
    console.log("Questions Evaluated Count:", reportData.data?.questions?.filter(q => q.userAnswer).length);
    if (reportRes.status !== 200 || !reportData.data?.overallScore) {
      throw new Error(`Report fetch failed: ${JSON.stringify(reportData)}`);
    }

    console.log("\n=== ALL INTERVIEW SIMULATION TESTS PASSED SUCCESSFULLY! ===");
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

runInterviewTests();
