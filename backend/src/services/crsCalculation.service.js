/**
 * CRS Calculation Service — Module 7: Career Intelligence Engine
 *
 * Computes the Career Readiness Score (CRS) from four weighted components:
 *   CRS = (learningMastery × 0.30) + (interviewReadiness × 0.40)
 *       + (consistencyScore × 0.10) + (roleAlignment × 0.20)
 *
 * - learningMastery: Pulled from user.learningProfile.overallMasteryScore (Module 3/4)
 * - interviewReadiness: The already-computed IRS value
 * - consistencyScore: Derived from frequency and recency of assessment attempts
 * - roleAlignment: How well the user's target role matches their resume and topic choices
 *
 * Classification:
 *   85 – 100 → Career Ready
 *   70 –  84 → On Track
 *   50 –  69 → Progressing
 *    0 –  49 → Early Stage
 */

// ----- Classification helper -----
/**
 * Returns the CRS classification label for a given score.
 * @param {number} score - The computed CRS value (0–100)
 * @returns {string} Classification label
 */
export const classifyCRS = (score) => {
  if (score >= 85) return "Career Ready";
  if (score >= 70) return "On Track";
  if (score >= 50) return "Progressing";
  return "Early Stage";
};

// ----- Consistency Score helper -----
/**
 * Derives a consistency score from the number of historical attempts.
 * More attempts = higher consistency, capped at 100.
 *
 * Formula: min(100, attemptCount × 12)
 * - 1 attempt = 12  (just started)
 * - 5 attempts = 60 (moderate)
 * - 8+ attempts = 96+ (highly consistent)
 *
 * @param {number} attemptCount - Total number of score history records for the user
 * @returns {number} Consistency score (0–100)
 */
export const deriveConsistencyScore = (attemptCount = 0) => {
  return Math.min(100, Math.max(0, attemptCount * 12));
};

// ----- Main calculation -----
/**
 * Calculates the Career Readiness Score (CRS).
 *
 * @param {object} params
 * @param {number} params.learningMastery    - Overall topic mastery from Module 3/4 (0–100)
 * @param {number} params.interviewReadiness - The computed IRS value (0–100)
 * @param {number} params.consistencyScore   - Derived from attempt frequency (0–100)
 * @param {number} params.roleAlignment      - Role match % from resume skills vs target role (0–100)
 *
 * @returns {{ CRS: number, crsClassification: string, breakdown: object }}
 */
export const calculateCRS = ({
  learningMastery = 0,
  interviewReadiness = 0,
  consistencyScore = 0,
  roleAlignment = 0,
}) => {
  // Clamp all inputs to [0, 100]
  const lm  = Math.min(100, Math.max(0, learningMastery));
  const ir  = Math.min(100, Math.max(0, interviewReadiness));
  const cs  = Math.min(100, Math.max(0, consistencyScore));
  const ra  = Math.min(100, Math.max(0, roleAlignment));

  // Weighted formula
  const raw =
    lm * 0.30 +  // Learning Mastery contributes 30%
    ir * 0.40 +  // Interview Readiness contributes 40% (highest weight)
    cs * 0.10 +  // Consistency Score contributes 10%
    ra * 0.20;   // Role Alignment contributes 20%

  const CRS = Math.round(raw);
  const crsClassification = classifyCRS(CRS);

  return {
    CRS,
    crsClassification,
    breakdown: {
      learningMastery: lm,
      interviewReadiness: ir,
      consistencyScore: cs,
      roleAlignment: ra,
    },
  };
};
