/**
 * Topic Mastery Recalculation Service.
 * Implements the formula:
 * Topic Mastery = (Quiz Score * 0.50) + (Assignment Score * 0.30) + (Consistency * 0.20)
 * Re-scales overall risk levels and next assignment difficulty.
 */

/**
 * Updates a user's learning profile after evaluating an assignment.
 * @param {object} user - Mongoose User document
 * @param {string} topicName - Name of the topic evaluated
 * @param {number} assignmentScore - Score computed by evaluation engine (0-100)
 * @returns {Promise<object>} - Mastery update report
 */
export const updateTopicMastery = async (user, topicName, assignmentScore) => {
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

  // 1. Locate the topic in user's learning profile
  let topic = user.learningProfile.topicMastery.find(
    (t) => t.topicName.toLowerCase() === topicName.toLowerCase()
  );

  let oldMasteryScore = 0;

  if (topic) {
    oldMasteryScore = topic.masteryScore;
    topic.attemptsCount += 1;
    topic.assignmentScore = assignmentScore;
  } else {
    // Initialize if it's the first time
    topic = {
      topicName,
      masteryScore: 0,
      quizAccuracy: 75, // Default quiz score if no quiz is taken yet
      assignmentScore: assignmentScore,
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

  // Formula: (Quiz Score * 0.50) + (Assignment Score * 0.30) + (Consistency * 0.20)
  const rawMastery = (quizScore * 0.50) + (assignmentScore * 0.30) + (consistency * 0.20);
  topic.masteryScore = Math.min(100, Math.max(0, Math.round(rawMastery)));

  // 3. Recalculate Overall Mastery Score (average of all topics)
  const topicsCount = user.learningProfile.topicMastery.length;
  const totalMasterySum = user.learningProfile.topicMastery.reduce((sum, t) => sum + t.masteryScore, 0);
  user.learningProfile.overallMasteryScore = topicsCount > 0 ? Math.round(totalMasterySum / topicsCount) : 0;

  // 4. Update Risk Level based on overall mastery
  // Low if >= 75, Moderate if >= 50, otherwise High
  const overallMastery = user.learningProfile.overallMasteryScore;
  if (overallMastery >= 75) {
    user.learningProfile.riskLevel = "low";
  } else if (overallMastery >= 50) {
    user.learningProfile.riskLevel = "moderate";
  } else {
    user.learningProfile.riskLevel = "high";
  }

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
