/**
 * Interview Simulation Question Bank.
 * Categorized by Target Role, Skill Stack keywords, and category focus.
 */

const ROLE_QUESTIONS = {
  "Full-Stack Developer": {
    "Technical": [
      {
        questionText: "Explain the virtual DOM reconciliation process in React and how the key prop affects rendering performance.",
        difficulty: "Medium"
      },
      {
        questionText: "How does the Node.js event loop handle asynchronous I/O operations under the hood? Contrast it with multi-threaded runtimes.",
        difficulty: "Hard"
      }
    ],
    "Behavioral": [
      {
        questionText: "Describe a situation where you had a strong technical disagreement with a peer. What was the conflict and how did you reach alignment?",
        difficulty: "Easy"
      }
    ],
    "System Design": [
      {
        questionText: "Design a distributed rate-limiting middleware for a high-traffic REST API that can process up to 100k requests per second securely.",
        difficulty: "Hard"
      }
    ],
    "Project Deep-Dive": [
      {
        questionText: "Walk me through a complex data synchronization or caching flow in a project you built. What trade-offs did you make regarding consistency and latency?",
        difficulty: "Medium"
      }
    ]
  },
  "Data Scientist": {
    "Technical": [
      {
        questionText: "What is the mathematical difference between L1 and L2 regularization? Under what scenarios would you choose one over the other?",
        difficulty: "Medium"
      },
      {
        questionText: "Explain the concept of bias-variance trade-off. How do ensemble methods like Random Forests or Gradient Boosting modify this trade-off?",
        difficulty: "Hard"
      }
    ],
    "Behavioral": [
      {
        questionText: "Tell me about a time when a machine learning model failed to deliver the expected business value. How did you diagnose the issue and communicate it to business sponsors?",
        difficulty: "Easy"
      }
    ],
    "System Design": [
      {
        questionText: "Design a real-time analytics scoring pipeline that ingests continuous telemetry streams from 10M IoT devices and detects anomalies with latency <50ms.",
        difficulty: "Hard"
      }
    ],
    "Project Deep-Dive": [
      {
        questionText: "Describe a project where you had to deal with highly imbalanced or extremely noisy data. Detail your feature engineering and model validation strategy.",
        difficulty: "Medium"
      }
    ]
  }
};

const DEFAULT_QUESTIONS = {
  "Technical": [
    {
      questionText: "Explain the differences between processes and threads, and how virtual memory isolation enforces security in modern operating systems.",
      difficulty: "Medium"
    }
  ],
  "Behavioral": [
    {
      questionText: "Describe a time when you were assigned a task with extremely ambiguous requirements. How did you structure your discovery process and execute?",
      difficulty: "Easy"
    }
  ],
  "System Design": [
    {
      questionText: "Design a horizontally-scalable CDN architecture to deliver high-volume static media files globally with low edge latencies.",
      difficulty: "Hard"
    }
  ],
  "Project Deep-Dive": [
    {
      questionText: "Detail a critical pipeline bottleneck or server outage you investigated in a previous project. What was the root cause and how did you patch it?",
      difficulty: "Medium"
    }
  ]
};

/**
 * Returns a tailored list of 4 questions (one from each category).
 * @param {string} targetRole - Job role chosen
 * @param {string[]} skillStack - List of skills (optional)
 * @returns {object[]} - Array of question details { questionText, category, difficulty }
 */
export const getTailoredQuestions = (targetRole = "", skillStack = []) => {
  // Find matching roles case-insensitively
  let matchingRoleKey = Object.keys(ROLE_QUESTIONS).find(
    (key) => key.toLowerCase() === targetRole.toLowerCase()
  );
  
  const questionPool = matchingRoleKey ? ROLE_QUESTIONS[matchingRoleKey] : DEFAULT_QUESTIONS;
  const categories = ["Technical", "Behavioral", "System Design", "Project Deep-Dive"];
  const tailoredSet = [];

  for (const category of categories) {
    let pool = questionPool[category];
    if (!pool || pool.length === 0) {
      // Fallback to default questions if category is missing for role
      pool = DEFAULT_QUESTIONS[category];
    }
    
    // Choose a random question from pool
    const randIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randIdx];

    tailoredSet.push({
      questionText: chosen.questionText,
      category: category,
      difficulty: chosen.difficulty
    });
  }

  return tailoredSet;
};
