import geminiService from "./gemini.service.js";

/**
 * Latency-Optimized Interview Evaluation Service.
 * Grades user text inputs using Gemini API, with a fallback to lexical parameter matching.
 */

const KEYWORD_CRITERIA = [
  {
    pattern: /virtual dom|reconciliation|key|diff/i,
    keywords: ["virtual dom", "reconciliation", "key", "diffing", "render"],
    depth: ["fiber", "tree snapshot", "vdom", "props reconciliation"],
    jargon: ["reconciliation", "rendering", "props", "batching"]
  },
  {
    pattern: /event loop|async|thread|i\/o/i,
    keywords: ["event loop", "async", "single thread", "callback", "non-blocking"],
    depth: ["libuv", "worker threads", "microtask queue", "polling phase"],
    jargon: ["execution context", "concurrency", "asynchronous", "blocking"]
  },
  {
    pattern: /disagree|conflict|resolution|agreement/i,
    keywords: ["disagreement", "resolution", "communicate", "listen", "alignment"],
    depth: ["constructive alignment", "compromise", "data-driven decisions", "objective criteria"],
    jargon: ["stakeholders", "alignment", "communication", "compromise"]
  },
  {
    pattern: /rate limit|middleware|redis/i,
    keywords: ["rate limit", "redis", "middleware", "throttling", "token bucket"],
    depth: ["sliding window log", "leaky bucket", "ip address headers", "distributed lock"],
    jargon: ["middleware", "throttling", "headers", "distributed"]
  },
  {
    pattern: /regularization|l1|l2|bias|variance/i,
    keywords: ["regularization", "l1", "l2", "lasso", "ridge", "overfitting"],
    depth: ["weight decay", "sparsity constraint", "cross validation", "feature selection"],
    jargon: ["regularization", "hyperparameter", "sparsity", "penalty"]
  },
  {
    pattern: /cdn|cache|latency|edge/i,
    keywords: ["cdn", "cache", "edge server", "latency", "ttl"],
    depth: ["anycast routing", "origin shield", "stale-while-revalidate", "cache invalidation"],
    jargon: ["ttl", "edge", "origin", "replica"]
  }
];

const GENERAL_CRITERIA = {
  keywords: ["system", "logic", "process", "implementation", "methodology"],
  depth: ["trade-offs", "scalability details", "efficiency considerations", "modular architecture"],
  jargon: ["architecture", "efficiency", "framework", "module"]
};

// Logical transition phrases
const LOGICAL_TRANSITIONS = [
  /\bfirstly\b/i, /\bsecondly\b/i, /\bconsequently\b/i, /\bhowever\b/i,
  /\bbecause\b/i, /\bfor example\b/i, /\bto prevent\b/i, /\bas a result\b/i,
  /\bfinally\b/i, /\bin addition\b/i, /\btherefore\b/i
];

/**
 * Evaluates a single question response.
 * @param {string} questionText - Text of the mock interview question
 * @param {string} answerText - User submitted reply
 * @returns {Promise<object>} - { score, feedback, missingConcepts }
 */
export const evaluateInterviewAnswer = async (questionText, answerText = "") => {
  // 1. Try evaluating with Gemini first
  const geminiResult = await geminiService.evaluateInterviewAnswer(questionText, answerText);
  if (geminiResult) {
    return {
      score: geminiResult.score,
      feedback: geminiResult.feedback,
      missingConcepts: geminiResult.missingConcepts || []
    };
  }

  // 2. Fallback to lexical criteria
  const text = answerText.trim();
  const textLen = text.length;

  // 1. Completeness (25% Weight - 25 pts)
  let completenessScore = 0;
  if (textLen >= 150) completenessScore = 25;
  else if (textLen >= 100) completenessScore = 20;
  else if (textLen >= 50) completenessScore = 12;
  else if (textLen >= 10) completenessScore = 5;

  // Find criteria match
  let criteria = KEYWORD_CRITERIA.find(c => c.pattern.test(questionText));
  if (!criteria) {
    criteria = GENERAL_CRITERIA;
  }

  // 2. Keyword Relevance (25% Weight - 25 pts)
  let keywordMatches = 0;
  const matchedKeywords = [];
  const missingKeywords = [];
  
  for (const kw of criteria.keywords) {
    const rx = new RegExp(`\\b${kw.replace(" ", "\\s+")}\\b`, "i");
    if (rx.test(text)) {
      keywordMatches += 1;
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }
  const kwScore = Math.min(25, Math.round((keywordMatches / criteria.keywords.length) * 25));

  // 3. Technical Depth (20% Weight - 20 pts)
  let depthMatches = 0;
  for (const dp of criteria.depth) {
    const rx = new RegExp(dp.replace(" ", "\\s+"), "i");
    if (rx.test(text)) {
      depthMatches += 1;
    }
  }
  const depthScore = Math.min(20, Math.round((depthMatches / criteria.depth.length) * 20));

  // 4. Logical Structure (15% Weight - 15 pts)
  let structureMatches = 0;
  for (const rx of LOGICAL_TRANSITIONS) {
    if (rx.test(text)) {
      structureMatches += 1;
    }
  }
  const structureScore = Math.min(15, structureMatches * 5); // 5 pts per transition found

  // 5. Terminology (15% Weight - 15 pts)
  let jargonMatches = 0;
  for (const jg of criteria.jargon) {
    const rx = new RegExp(`\\b${jg}\\b`, "i");
    if (rx.test(text)) {
      jargonMatches += 1;
    }
  }
  const jargonScore = Math.min(15, Math.round((jargonMatches / criteria.jargon.length) * 15));

  // Total Grade Calculations
  const finalScore = Math.min(100, completenessScore + kwScore + depthScore + structureScore + jargonScore);

  // Generate Qualitative Feedback
  let feedback = "";
  if (finalScore >= 85) {
    feedback = "Excellent answer! You demonstrated solid depth, proper structure, and clear command of key industry terms.";
  } else if (finalScore >= 65) {
    feedback = "Good response. It covers the core requirements, but you should structure it better with transitional examples and mention detailed concepts.";
  } else {
    feedback = "The answer is brief or lacks critical details. Focus on describing technical trade-offs and clarify vocabulary terms.";
  }

  return {
    score: finalScore,
    feedback,
    missingConcepts: missingKeywords.slice(0, 3) // Return first 3 missing keywords as concept gaps
  };
};
