/**
 * IRS Calculation Service — Module 7: Career Intelligence Engine
 *
 * Computes the Interview Readiness Score (IRS) from four weighted components:
 *   IRS = (resumeStrength × 0.20) + (technicalPerformance × 0.40)
 *       + (behavioralPerformance × 0.20) + (roleSkillMatch × 0.20)
 *
 * Classification:
 *   85 – 100 → Highly Ready
 *   70 –  84 → Moderately Ready
 *   50 –  69 → Developing
 *    0 –  49 → Needs Significant Improvement
 */

// ----- Classification helper -----
/**
 * Returns the IRS classification label for a given score.
 * @param {number} score - The computed IRS value (0–100)
 * @returns {string} Classification label
 */
export const classifyIRS = (score) => {
  if (score >= 85) return "Highly Ready";
  if (score >= 70) return "Moderately Ready";
  if (score >= 50) return "Developing";
  return "Needs Significant Improvement";
};

// ----- Main calculation -----
/**
 * Calculates the Interview Readiness Score (IRS).
 *
 * @param {object} params
 * @param {number} params.resumeStrength       - Resume strength score (0–100) from Module 2
 * @param {number} params.technicalPerformance - Technical interview score (0–100) from Module 6
 * @param {number} params.behavioralPerformance- Behavioral interview score (0–100) from Module 6
 * @param {number} params.roleSkillMatch       - % match between user skills and target role (0–100)
 *
 * @returns {{ IRS: number, irsClassification: string, breakdown: object }}
 */
export const calculateIRS = ({
  resumeStrength = 0,
  technicalPerformance = 0,
  behavioralPerformance = 0,
  roleSkillMatch = 0,
}) => {
  // Clamp all inputs to [0, 100]
  const rs  = Math.min(100, Math.max(0, resumeStrength));
  const tp  = Math.min(100, Math.max(0, technicalPerformance));
  const bp  = Math.min(100, Math.max(0, behavioralPerformance));
  const rsm = Math.min(100, Math.max(0, roleSkillMatch));

  // Weighted formula
  const raw =
    rs  * 0.20 +  // Resume Strength contributes 20%
    tp  * 0.40 +  // Technical Performance contributes 40% (highest weight)
    bp  * 0.20 +  // Behavioral Performance contributes 20%
    rsm * 0.20;   // Role Skill Match contributes 20%

  const IRS = Math.round(raw);
  const irsClassification = classifyIRS(IRS);

  return {
    IRS,
    irsClassification,
    breakdown: {
      resumeStrength: rs,
      technicalPerformance: tp,
      behavioralPerformance: bp,
      roleSkillMatch: rsm,
    },
  };
};
