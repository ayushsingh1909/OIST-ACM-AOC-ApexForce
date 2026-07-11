import geminiService from "./gemini.service.js";

/**
 * AI Simulation Evaluation Engine for ACIE Assignments.
 * Grades submissions using Gemini API, with a deterministic regex-based fallback.
 */

// Predefined concept criteria based on topics
const TOPIC_CRITERIA = {
  "React Hooks": [
    { concept: "Loading State Handling", pattern: /loading|isloading|setloading/i, scoreContribution: 10, failureMessage: "Missing state tracking for loading indicator." },
    { concept: "Error State Handling", pattern: /error|seterror|catch/i, scoreContribution: 10, failureMessage: "Missing error handling blocks or state mapping." },
    { concept: "In-Memory Cache Map", pattern: /cache|memo|usememo|map/i, scoreContribution: 10, failureMessage: "No caching mechanism detected to prevent duplicate API fetches." },
    { concept: "Component Unmount Cleanup", pattern: /return\s*\(\)\s*=>|abort|unsubscribe/i, scoreContribution: 10, failureMessage: "Missing cleanup handlers to prevent memory leaks on unmount." }
  ],
  "SQL Joins": [
    { concept: "Multi-Table Joining", pattern: /join|inner\s+join|left\s+join|right\s+join/i, scoreContribution: 10, failureMessage: "No table join operators detected." },
    { concept: "Primary Key Mapping", pattern: /\bon\b/i, scoreContribution: 10, failureMessage: "Missing 'ON' clauses to map join constraints." },
    { concept: "Data Aggregation", pattern: /group\s+by|count|sum|avg|max|min/i, scoreContribution: 10, failureMessage: "Missing GROUP BY or aggregation functions." },
    { concept: "Performance Optimizations", pattern: /index|\bexplain\b|where|limit/i, scoreContribution: 10, failureMessage: "No filters or indexes suggested for join optimization." }
  ],
  "System Design": [
    { concept: "Horizontal Scaling", pattern: /scale|load\s*balancer|nginx|horizontal|replica/i, scoreContribution: 10, failureMessage: "Lacks horizontal scaling or load balancing strategies." },
    { concept: "Caching Layer", pattern: /redis|memcached|cdn|cache/i, scoreContribution: 10, failureMessage: "Missing cache nodes to reduce database load." },
    { concept: "Relational/Non-Relational DB Selection", pattern: /database|postgres|sql|mongodb|nosql|cassandra/i, scoreContribution: 10, failureMessage: "Lacks clear database rationale or choice justification." },
    { concept: "Asynchronous Decoupling", pattern: /queue|kafka|rabbitmq|pub\/?sub|async/i, scoreContribution: 10, failureMessage: "Lacks message queues or pub/sub layers to decouple systems." }
  ]
};

// Default criteria for any other topic
const DEFAULT_CRITERIA = [
  { concept: "Logical Completeness", pattern: /.{50,}/s, scoreContribution: 10, failureMessage: "Answer or code submission is too brief." },
  { concept: "Validation / Edge-Case Checks", pattern: /try|catch|if|validate|error|assert/i, scoreContribution: 10, failureMessage: "Lacks validation logic or error-boundary handling." },
  { concept: "Modularity & Structure", pattern: /function|class|const|let|def|\s{2,}/i, scoreContribution: 10, failureMessage: "Submission has poor formatting or lacks modular code blocks." },
  { concept: "Efficiency & Readability", pattern: /comment|docstring|\/\/|#|\bconst\b/i, scoreContribution: 10, failureMessage: "Lacks comments, docstrings, or clean code structures." }
];

/**
 * Evaluates a submission using Gemini API or a simulated fallback.
 * @param {object} assignment - Mongoose Assignment document
 * @param {object} submission - Submission body { submissionMode, content, githubLink }
 * @returns {Promise<object>}
 */
export const evaluateSubmission = async (assignment, submission) => {
  // 1. Attempt dynamic Gemini evaluation
  const geminiEval = await geminiService.evaluateSubmission(assignment, submission);
  if (geminiEval) {
    return {
      score: geminiEval.score,
      evaluatedAt: new Date(),
      conceptCoverage: geminiEval.conceptCoverage || [],
      mistakeBreakdown: geminiEval.mistakeBreakdown || [],
      improvementSuggestions: geminiEval.improvementSuggestions || []
    };
  }

  // 2. Fallback to simulated evaluation
  const { topicName, assignmentType } = assignment;
  const { mode, content = "", githubLink = "" } = submission;

  // Combine content for inspection
  const fullTextToInspect = `${content} ${githubLink}`;

  // 1. Fetch criteria based on topic
  let criteria = TOPIC_CRITERIA[topicName];
  if (!criteria) {
    // Check if closely matches
    const key = Object.keys(TOPIC_CRITERIA).find(t => t.toLowerCase() === topicName.toLowerCase());
    criteria = key ? TOPIC_CRITERIA[key] : DEFAULT_CRITERIA;
  }

  // 2. Perform matches
  const conceptCoverage = [];
  const mistakeBreakdown = [];
  const improvementSuggestions = [];
  
  let scoreMultiplier = 60; // Starting baseline score

  for (const crit of criteria) {
    const isCovered = crit.pattern.test(fullTextToInspect);
    conceptCoverage.push({
      concept: crit.concept,
      covered: isCovered
    });

    if (isCovered) {
      scoreMultiplier += crit.scoreContribution;
    } else {
      mistakeBreakdown.push({
        category: crit.concept,
        details: crit.failureMessage
      });
      improvementSuggestions.push(`Improve ${crit.concept}: ${crit.failureMessage.replace("Missing ", "Add ").replace("Lacks ", "Implement ").replace("No ", "Configure ")}`);
    }
  }

  // Bonus points for providing a GitHub link
  if (githubLink.trim() && githubLink.includes("github.com")) {
    scoreMultiplier += 5;
  }

  // Ensure score stays bounded [0, 100]
  const finalScore = Math.min(100, Math.max(0, Math.round(scoreMultiplier)));

  if (finalScore === 100) {
    improvementSuggestions.push("Excellent work! Your submission meets all structural, efficiency, and logical requirements. Try to scale/stress test the code under load next.");
  }

  return {
    score: finalScore,
    evaluatedAt: new Date(),
    conceptCoverage,
    mistakeBreakdown,
    improvementSuggestions
  };
};
