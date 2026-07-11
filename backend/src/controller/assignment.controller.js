import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
import { evaluateSubmission } from "../services/evaluation.service.js";
import { updateTopicMastery } from "../services/mastery.service.js";
import geminiService from "../services/gemini.service.js";

// Assignment templates database categorized by Topic focus
const ASSIGNMENT_TEMPLATES = {
  "React Hooks": [
    {
      title: "Build a Custom React Hook for Data Fetching & Caching",
      type: "Coding",
      problemStatement: "Implement a custom hook `useFetch` that takes a `url` and optional `options`. The hook must: 1. Keep track of isLoading, error, and response data state. 2. Handle caching: If the URL has been fetched already, return cached data immediately instead of triggering a duplicate request. 3. Prevent memory leaks: Cancel the fetch request using AbortController if the component unmounts before completion."
    },
    {
      title: "Debug a Memory Leak in a Real-Time Hook",
      type: "Debugging",
      problemStatement: "The provided hook `useSubscription` establishes a WebSocket connection but leaks memory and crashes the app when switching views. Your task is to identify why events are stacking up, fix the cleanup listener registration, and ensure the socket disconnects on unmount."
    },
    {
      title: "Design a Global State Hook System",
      type: "System Design",
      problemStatement: "Design a lightweight, hook-based state management framework similar to Redux or Zustand. Explain the publish-subscribe mechanism, hook subscription lifecycle, and how components force-re-render when the shared state store changes."
    }
  ],
  "SQL Joins": [
    {
      title: "Analyze E-commerce Sales Performance via Multi-Table Joins",
      type: "Coding",
      problemStatement: "Write a SQL query that joins `Orders`, `Customers`, `OrderItems`, and `Products` tables to find customers who spent more than $500 in the last 30 days. Display customer name, total items, and overall amount spent, sorted descending. Use proper INNER/LEFT joins and indexes."
    },
    {
      title: "Compare LEFT, RIGHT, and INNER Join Performance Gaps",
      type: "Analytical",
      problemStatement: "Explain the performance differences between LEFT, RIGHT, and INNER Joins when running queries against a database containing millions of customer and transaction records. Discuss how query optimizers evaluate hash joins vs nested loops, and how index coverage mitigates bottlenecks."
    },
    {
      title: "Resolve an Inefficient Product Catalog Left Join",
      type: "Debugging",
      problemStatement: "A developer wrote a query using multiple LEFT JOINs to fetch a category tree, resulting in Cartesian products and slow response times. Correct the query to use INNER JOINs where appropriate, filter on keys properly, and explain the changes."
    }
  ],
  "System Design": [
    {
      title: "Design a Scalable Real-Time Notification Service",
      type: "System Design",
      problemStatement: "Design a notification system capable of sending push, email, and SMS alerts to 10M active users per day. Address: 1. How to scale connection handling (WebSockets/SSE). 2. How to leverage Redis for message queuing and deduplication. 3. Message persistence strategies for audit trails."
    },
    {
      title: "Analyze Post-Mortem Data Inconsistencies during Database Sharding",
      type: "Case Study",
      problemStatement: "A microservices application experienced transaction inconsistencies after sharding its primary SQL database. Analyze the scenario: What caused split-brain scenarios or latency spikes? Detail your recommendation to restore consistency using 2-Phase Commit (2PC) or Saga orchestrations."
    }
  ]
};

// General fallback templates for other topics
const GENERAL_TEMPLATES = [
  {
    title: "Implement a Robust Algorithmic Solution",
    type: "Coding",
    problemStatement: "Create a modular, well-tested algorithm to solve the core requirements of this topic. Ensure inputs are validated, edge cases are caught with try-catch blocks, and efficiency is optimized (aim for O(N log N) complexity or better)."
  },
  {
    title: "Analyze Architectural Trade-offs",
    type: "System Design",
    problemStatement: "Describe the system architecture required to support the practical skill demands of this topic focus. Detail the structural layout, modularity components, validation gates, and caching mechanisms to reduce latencies."
  }
];

/**
 * Automatically generates a topic-specific assignment.
 * If no topic is provided, selects the user's weakest topic from their mastery profile.
 */
export const generateAssignment = async (req, res) => {
  try {
    const user = req.user;
    let { topicName, targetRole, difficulty, assignmentType } = req.body;

    // 1. Target Role fallback
    if (!targetRole) {
      targetRole = user.learningProfile?.targetRole || "Full-Stack Developer";
    }

    // 2. Weakest Topic Identification
    if (!topicName) {
      const topicMastery = user.learningProfile?.topicMastery || [];
      if (topicMastery.length > 0) {
        // Find topic with the lowest masteryScore
        const weakest = [...topicMastery].sort((a, b) => a.masteryScore - b.masteryScore)[0];
        topicName = weakest.topicName;
      } else {
        // Default fallback if no profile tracking exists yet
        topicName = "React Hooks";
      }
    }

    // 3. Difficulty Scaling
    if (!difficulty) {
      const topicMastery = user.learningProfile?.topicMastery || [];
      const topic = topicMastery.find(t => t.topicName.toLowerCase() === topicName.toLowerCase());
      const score = topic ? topic.masteryScore : 0;

      if (score < 50) difficulty = "Easy";
      else if (score < 75) difficulty = "Medium";
      else difficulty = "Hard";
    }

    // 4. Generate Assignment using Gemini or Fallback
    const selectedType = assignmentType || "Coding";
    let assignmentData = await geminiService.generateAssignment({
      topicName,
      targetRole,
      difficulty,
      assignmentType: selectedType
    });

    let finalTitle, finalProblemStatement, finalType;

    if (assignmentData) {
      finalTitle = assignmentData.title;
      finalProblemStatement = assignmentData.problemStatement;
      finalType = selectedType;
    } else {
      // Fallback: Select Assignment Template
      let templates = ASSIGNMENT_TEMPLATES[topicName];
      if (!templates) {
        // Find case-insensitive match
        const key = Object.keys(ASSIGNMENT_TEMPLATES).find(k => k.toLowerCase() === topicName.toLowerCase());
        templates = key ? ASSIGNMENT_TEMPLATES[key] : GENERAL_TEMPLATES;
      }

      // Find templates matching the selected type, or select any
      let template = templates.find(t => t.type === selectedType);
      if (!template) {
        // Random pick from available templates
        const randIdx = Math.floor(Math.random() * templates.length);
        template = templates[randIdx];
      }
      finalTitle = template.title;
      finalProblemStatement = template.problemStatement;
      finalType = template.type;
    }

    // 5. Create assignment instance
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const assignment = new Assignment({
      user: user._id,
      topicName,
      targetRole,
      title: finalTitle,
      problemStatement: finalProblemStatement,
      assignmentType: finalType,
      difficulty,
      dueDate,
      status: "pending"
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: "Assignment generated successfully",
      data: assignment
    });

  } catch (error) {
    console.error("Assignment generation error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate assignment"
    });
  }
};

/**
 * Submits assignment deliverables and evaluates them using the AI simulation.
 */
export const submitAssignment = async (req, res) => {
  try {
    const user = req.user;
    const assignmentId = req.params.id;
    const { submissionMode, content, githubLink } = req.body;

    // 1. Fetch assignment and verify ownership
    const assignment = await Assignment.findOne({ _id: assignmentId, user: user._id });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found or does not belong to the user" });
    }

    if (assignment.status === "completed") {
      return res.status(400).json({ success: false, message: "Assignment has already been completed and evaluated" });
    }

    // 2. Capture submission details
    let submissionContent = content || "";
    if (submissionMode === "File") {
      if (req.file) {
        submissionContent = `Uploaded file: uploads/submissions/${req.file.originalname}`;
      } else {
        return res.status(400).json({ success: false, message: "File upload expected for File submission mode" });
      }
    }

    // 3. Trigger AI simulated evaluation engine
    const evaluation = await evaluateSubmission(assignment, {
      mode: submissionMode,
      content: submissionContent,
      githubLink
    });

    // 4. Update assignment document
    assignment.status = "completed";
    assignment.submission = {
      mode: submissionMode,
      content: submissionContent + (githubLink ? ` (Repo: ${githubLink})` : ""),
      submittedAt: new Date()
    };
    assignment.evaluation = evaluation;

    await assignment.save();

    // 5. Update user topic mastery and risk profiles
    const masteryReport = await updateTopicMastery(user, assignment.topicName, evaluation.score);

    res.status(200).json({
      success: true,
      message: "Assignment evaluated successfully",
      data: {
        status: assignment.status,
        submission: assignment.submission,
        evaluation: assignment.evaluation,
        masteryUpdate: {
          topicName: masteryReport.topicName,
          oldMasteryScore: masteryReport.oldMasteryScore,
          newMasteryScore: masteryReport.newMasteryScore,
          newOverallMastery: masteryReport.newOverallMastery,
          newRiskLevel: masteryReport.newRiskLevel
        }
      }
    });

  } catch (error) {
    console.error("Assignment submission error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit assignment"
    });
  }
};

/**
 * Fetches all assignments (pending and completed) for the logged-in user.
 */
export const getUserAssignments = async (req, res) => {
  try {
    const userId = req.user._id;

    const assignments = await Assignment.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (error) {
    console.error("Fetch assignments error:", error.stack || error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve assignments"
    });
  }
};
