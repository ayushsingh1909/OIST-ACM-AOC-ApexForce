/**
 * Topic Mastery Recalculation Service.
 * Implements the formula:
 * Topic Mastery = (Quiz Score * 0.50) + (Assignment Score * 0.30) + (Consistency * 0.20)
 * Re-scales overall risk levels and next assignment difficulty.
 */

/**
 * Updates a user's learning profile after evaluating an assignment or quiz.
 * Supports both raw score parameters and config object inputs for backward compatibility.
 * @param {object} user - Mongoose User document
 * @param {string} topicName - Name of the topic evaluated
 * @param {number|object} input - Score number OR config object { assignmentScore, quizAccuracy }
 * @returns {Promise<object>} - Mastery update report
 */
export const updateTopicMastery = async (user, topicName, input) => {
  if (!user.learningProfile) {
    user.learningProfile = {
      targetRole: "Full-Stack Developer",
      overallMasteryScore: 0,
      riskLevel: "high",
      topicMastery: [],
      mistakeHistory: []
    };
  }

  if (!user.learningProfile.topicMastery) {
    user.learningProfile.topicMastery = [];
  }

  let assignmentScoreInput = null;
  let quizAccuracyInput = null;

  if (typeof input === "number") {
    assignmentScoreInput = input;
  } else if (input && typeof input === "object") {
    assignmentScoreInput = input.assignmentScore;
    quizAccuracyInput = input.quizAccuracy;
  }

  // 1. Locate the topic in user's learning profile
  let topic = user.learningProfile.topicMastery.find(
    (t) => t.topicName.toLowerCase() === topicName.toLowerCase()
  );

  let oldMasteryScore = 0;

  if (topic) {
    oldMasteryScore = topic.masteryScore;
    topic.attemptsCount += 1;
    if (assignmentScoreInput !== null && assignmentScoreInput !== undefined) {
      topic.assignmentScore = assignmentScoreInput;
    }
    if (quizAccuracyInput !== null && quizAccuracyInput !== undefined) {
      topic.quizAccuracy = quizAccuracyInput;
    }
  } else {
    // Initialize if it's the first time
    topic = {
      topicName,
      masteryScore: 0,
      quizAccuracy: quizAccuracyInput !== null && quizAccuracyInput !== undefined ? quizAccuracyInput : 75,
      assignmentScore: assignmentScoreInput !== null && assignmentScoreInput !== undefined ? assignmentScoreInput : 0,
      attemptsCount: 1
    };
    user.learningProfile.topicMastery.push(topic);
    // Find the newly pushed topic reference
    topic = user.learningProfile.topicMastery[user.learningProfile.topicMastery.length - 1];
  }

  // 2. Perform math scoring calculations
  // Consistency = min(100, attemptsCount * 25)
  const consistency = Math.min(100, topic.attemptsCount * 25);
  const quizScore = topic.quizAccuracy || 75;
  const assignmentScore = topic.assignmentScore || 0;

  // Formula: (Quiz Score * 0.50) + (Assignment Score * 0.30) + (Consistency * 0.20)
  const rawMastery = (quizScore * 0.50) + (assignmentScore * 0.30) + (consistency * 0.20);
  topic.masteryScore = Math.min(100, Math.max(0, Math.round(rawMastery)));

  // 3. Recalculate Overall Mastery Score (average of all topics)
  user.learningProfile.overallMasteryScore = calculateOverallMastery(user.learningProfile.topicMastery);

  // 4. Update Risk Level based on overall mastery
  user.learningProfile.riskLevel = calculateRiskLevel(
    user.learningProfile.overallMasteryScore,
    user.learningProfile.topicMastery
  );

  // Save changes to Mongoose document
  await user.save();

  return {
    topicName: topic.topicName,
    oldMasteryScore,
    newMasteryScore: topic.masteryScore,
    newOverallMastery: user.learningProfile.overallMasteryScore,
    newRiskLevel: user.learningProfile.riskLevel
  };
};

/**
 * Calculates the overall mastery score across all topics.
 * @param {object[]} topicMastery - Array of topic mastery states
 * @returns {number}
 */
export const calculateOverallMastery = (topicMastery = []) => {
  if (topicMastery.length === 0) return 0;
  const totalMasterySum = topicMastery.reduce((sum, t) => sum + (t.masteryScore || 0), 0);
  return Math.round(totalMasterySum / topicMastery.length);
};

/**
 * Calculates overall risk level of student.
 * @param {number} overallMasteryScore
 * @param {object[]} topicMastery
 * @returns {string}
 */
export const calculateRiskLevel = (overallMasteryScore = 0, topicMastery = []) => {
  if (overallMasteryScore >= 75) return "low";
  if (overallMasteryScore >= 50) return "moderate";
  return "high";
};

/**
 * Returns a list of weak topics below a threshold.
 * @param {object} user - User document
 * @param {number} threshold - Mastery score threshold
 * @returns {object[]}
 */
export const getWeakTopics = (user, threshold = 60) => {
  const topicMastery = user?.learningProfile?.topicMastery || [];
  const weak = topicMastery.filter((t) => t.masteryScore < threshold);
  
  // Fallback defaults if no weak topics mapped yet
  if (weak.length === 0) {
    return [
      { topicName: "React Hooks", masteryScore: 0 },
      { topicName: "SQL Joins", masteryScore: 0 }
    ];
  }
  return weak;
};

const masteryService = {
  updateTopicMastery,
  calculateOverallMastery,
  calculateRiskLevel,
  getWeakTopics
};

export default masteryService;
