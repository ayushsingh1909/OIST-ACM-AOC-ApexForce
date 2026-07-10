/**
 * CCI Calculation Service — Module 7: Career Intelligence Engine
 *
 * Computes the Communication Clarity Index (CCI) from five sub-components.
 * Each component is scored 0–100 and combined with equal weighting.
 *
 * CCI = (grammarAccuracy × 0.25) + (logicalSequencing × 0.25)
 *     + (conceptArticulation × 0.20) + (redundancyScore_inverted × 0.15)
 *     + (starMethodCompliance × 0.15)
 *
 * Note: redundancyScore is stored as a raw "redundancy level" (higher = more redundant = worse).
 * It is inverted: redundancyContribution = (100 - redundancyLevel) × 0.15
 *
 * Classification:
 *   80 – 100 → Excellent
 *   60 –  79 → Good
 *   40 –  59 → Fair
 *    0 –  39 → Needs Improvement
 */

// ----- Classification helper -----
/**
 * Returns the CCI classification label for a given score.
 * @param {number} score - The computed CCI value (0–100)
 * @returns {string} Classification label
 */
export const classifyCCI = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
};

// ----- Main calculation -----
/**
 * Calculates the Communication Clarity Index (CCI).
 *
 * @param {object} params
 * @param {number} params.grammarAccuracy      - Grammar and language correctness (0–100)
 * @param {number} params.logicalSequencing    - How well ideas follow a logical order (0–100)
 * @param {number} params.conceptArticulation  - Clarity of concept explanation (0–100)
 * @param {number} params.redundancyLevel      - Level of redundancy/repetition detected (0–100, higher is worse)
 * @param {number} params.starMethodCompliance - Adherence to STAR method in behavioral answers (0–100)
 *
 * @returns {{ CCI: number, cciClassification: string, breakdown: object }}
 */
export const calculateCCI = ({
  grammarAccuracy = 0,
  logicalSequencing = 0,
  conceptArticulation = 0,
  redundancyLevel = 0,  // Raw redundancy level — inverted internally
  starMethodCompliance = 0,
}) => {
  // Clamp inputs to [0, 100]
  const ga  = Math.min(100, Math.max(0, grammarAccuracy));
  const ls  = Math.min(100, Math.max(0, logicalSequencing));
  const ca  = Math.min(100, Math.max(0, conceptArticulation));
  const rl  = Math.min(100, Math.max(0, redundancyLevel));
  const smc = Math.min(100, Math.max(0, starMethodCompliance));

  // Invert redundancy: low redundancy = high contribution
  const redundancyContribution = 100 - rl;

  // Weighted formula for CCI
  const raw =
    ga  * 0.25 +  // Grammar accuracy — 25%
    ls  * 0.25 +  // Logical sequencing — 25%
    ca  * 0.20 +  // Concept articulation — 20%
    redundancyContribution * 0.15 + // Inverted redundancy — 15%
    smc * 0.15;   // STAR method compliance — 15%

  const CCI = Math.round(raw);
  const cciClassification = classifyCCI(CCI);

  return {
    CCI,
    cciClassification,
    breakdown: {
      grammarAccuracy: ga,
      logicalSequencing: ls,
      conceptArticulation: ca,
      redundancyLevel: rl,           // Raw level stored in history
      redundancyContribution,        // Inverted value used in calculation
      starMethodCompliance: smc,
    },
  };
};
