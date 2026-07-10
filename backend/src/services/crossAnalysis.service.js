/**
 * Cross-Analysis & Adaptive Feedback Service — Module 7: Career Intelligence Engine
 *
 * After every interview/assessment session, this service:
 *   1. Identifies weak areas across three data sources:
 *      - Weak interview responses (low technicalScore / behavioralScore)
 *      - Low topic mastery scores (from user.learningProfile.topicMastery - Module 3/4)
 *      - Resume skill gaps (from user.resumeData.missingSkills - Module 2)
 *   2. Detects overlapping weaknesses (same topic appearing in 2+ sources = HIGH priority)
 *   3. Generates an adaptive feedback payload:
 *      - Flags topics as High/Medium/Low priority
 *      - Injects flagged topics into study plan
 *      - Increases revision frequency for high-priority topics
 *      - Recommends targeted mock interviews
 *   4. Returns flaggedTopics[] and weaknesses[] to be saved to ScoreHistory
 */

/**
 * Thresholds for weakness detection
 */
const THRESHOLDS = {
  TECHNICAL_WEAK: 60,    // technicalScore below this = technical weakness
  BEHAVIORAL_WEAK: 60,   // behavioralScore below this = behavioral weakness
  MASTERY_WEAK: 50,      // topicMastery below this = learning weakness
};

/**
 * Runs cross-analysis after an interview/assessment attempt.
 *
 * @param {object} params
 * @param {object}   params.user               - Full Mongoose User document
 * @param {number}   params.technicalScore     - Raw technical score from the latest session (0–100)
 * @param {number}   params.behavioralScore    - Raw behavioral score from the latest session (0–100)
 * @param {string[]} params.weakInterviewTopics- Topic names identified as weak in this session
 *
 * @returns {{
 *   weaknesses: Array<{area, source, details}>,
 *   flaggedTopics: Array<{topicName, priority, reason}>,
 *   adaptiveFeedback: {
 *     studyPlanInjections: string[],
 *     revisionBoosts: string[],
 *     mockInterviewRecommendations: string[],
 *   },
 *   adaptiveFeedbackTriggered: boolean
 * }}
 */
export const runCrossAnalysis = ({
  user,
  technicalScore = 0,
  behavioralScore = 0,
  weakInterviewTopics = [],
}) => {
  const weaknesses = [];
  const topicWeaknessMap = {}; // topic -> sources array

  // ----- Step 1: Detect interview-level weaknesses -----
  if (technicalScore < THRESHOLDS.TECHNICAL_WEAK) {
    weaknesses.push({
      area: "Technical Interview Performance",
      source: "interview",
      details: `Technical score of ${technicalScore}/100 is below the 60-point threshold. Focus on data structures, algorithms, and role-specific technical topics.`,
    });
  }

  if (behavioralScore < THRESHOLDS.BEHAVIORAL_WEAK) {
    weaknesses.push({
      area: "Behavioral Interview Performance",
      source: "interview",
      details: `Behavioral score of ${behavioralScore}/100 is below threshold. Practice STAR method responses for leadership, teamwork, and conflict-resolution scenarios.`,
    });
  }

  // Track weak interview topics by name
  for (const topic of weakInterviewTopics) {
    if (!topicWeaknessMap[topic]) topicWeaknessMap[topic] = [];
    topicWeaknessMap[topic].push("interview");
  }

  // ----- Step 2: Detect learning mastery weaknesses (Module 3/4) -----
  const topicMastery = user?.learningProfile?.topicMastery || [];
  for (const tm of topicMastery) {
    if (tm.masteryScore < THRESHOLDS.MASTERY_WEAK) {
      weaknesses.push({
        area: tm.topicName,
        source: "quiz/assignment",
        details: `Topic mastery for "${tm.topicName}" is ${tm.masteryScore}/100. Quiz accuracy: ${tm.quizAccuracy || 0}%, assignment score: ${tm.assignmentScore || 0}%.`,
      });

      if (!topicWeaknessMap[tm.topicName]) topicWeaknessMap[tm.topicName] = [];
      topicWeaknessMap[tm.topicName].push("quiz/assignment");
    }
  }

  // ----- Step 3: Detect resume skill gaps (Module 2) -----
  const missingSkills = user?.resumeData?.missingSkills || [];
  for (const skill of missingSkills) {
    weaknesses.push({
      area: skill,
      source: "resume",
      details: `Skill "${skill}" is missing from the resume and is required for the target role.`,
    });

    if (!topicWeaknessMap[skill]) topicWeaknessMap[skill] = [];
    topicWeaknessMap[skill].push("resume");
  }

  // ----- Step 4: Prioritize topics based on cross-source overlap -----
  const flaggedTopics = [];
  for (const [topicName, sources] of Object.entries(topicWeaknessMap)) {
    let priority;
    let reason;

    if (sources.length >= 2) {
      // Appearing in 2+ sources = HIGH priority (critical gap)
      priority = "High";
      reason = `Weakness detected in multiple sources: ${sources.join(", ")}. Immediate attention required.`;
    } else if (sources.includes("interview")) {
      priority = "High";
      reason = `Weak interview response detected for this topic. Targeted practice recommended.`;
    } else if (sources.includes("quiz/assignment")) {
      priority = "Medium";
      reason = `Low mastery score in learning module. Schedule additional revision sessions.`;
    } else {
      priority = "Low";
      reason = `Skill gap identified in resume. Consider adding this to your learning path.`;
    }

    flaggedTopics.push({ topicName, priority, reason });
  }

  // Sort: High → Medium → Low
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  flaggedTopics.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // ----- Step 5: Generate adaptive feedback payload -----
  const highPriorityTopics = flaggedTopics.filter((t) => t.priority === "High").map((t) => t.topicName);
  const mediumPriorityTopics = flaggedTopics.filter((t) => t.priority === "Medium").map((t) => t.topicName);

  const studyPlanInjections = highPriorityTopics.map(
    (t) => `[HIGH PRIORITY] Inject "${t}" into study plan — 3 sessions/week`
  );

  const revisionBoosts = mediumPriorityTopics.map(
    (t) => `[BOOST] Increase revision frequency for "${t}" to 2×/week`
  );

  const mockInterviewRecommendations = highPriorityTopics.slice(0, 3).map(
    (t) => `Schedule a targeted mock interview focused on: ${t}`
  );

  const adaptiveFeedbackTriggered = flaggedTopics.length > 0;

  return {
    weaknesses,
    flaggedTopics,
    adaptiveFeedback: {
      studyPlanInjections,
      revisionBoosts,
      mockInterviewRecommendations,
    },
    adaptiveFeedbackTriggered,
  };
};
