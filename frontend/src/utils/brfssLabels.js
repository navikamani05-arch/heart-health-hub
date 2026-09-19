/**
 * brfssLabels.js
 * 
 * Provides human-readable label lookup functions for BRFSS-coded numeric fields.
 * These are used for DISPLAY only — the underlying numeric values are
 * never altered and are always sent to the backend/model unchanged.
 */

/** 
 * Returns a human-readable label for an Age group code (1–13).
 * Pass the t() function from LanguageContext to get a translated string.
 */
export const getAgeLabel = (code, t) => t(`pred.age.${code}`, {}) || `Age Group ${code}`;

/**
 * Returns a human-readable label for an Education code (1–6).
 */
export const getEducationLabel = (code, t) => t(`pred.edu.${code}`, {}) || `Education ${code}`;

/**
 * Returns a human-readable label for an Income code (1–8).
 */
export const getIncomeLabel = (code, t) => t(`pred.inc.${code}`, {}) || `Income ${code}`;

/**
 * Returns a human-readable label for General Health code (1–5).
 */
export const getGenHlthLabel = (code, t) => t(`pred.genhlth.${code}`, {}) || `General Health ${code}`;

/**
 * Returns a human-readable label for Diabetes code (0, 1, 2).
 */
export const getDiabetesLabel = (code, t) => t(`pred.diabetes.${code}`, {}) || `Diabetes ${code}`;

/**
 * Parse the input_summary string stored in the database and replace coded values
 * with human-readable equivalents for display purposes.
 * 
 * The stored format is: "BMI: X, AgeGrp: Y, GenHlth: Z"
 * The returned string replaces Y and Z with readable labels.
 */
export const humaniseInputSummary = (summary, t) => {
  if (!summary) return summary;
  return summary.replace(/AgeGrp:\s*(\d+)/, (_, code) => `Age: ${getAgeLabel(Number(code), t)}`)
                .replace(/GenHlth:\s*(\d+)/,  (_, code) => `General Health: ${getGenHlthLabel(Number(code), t)}`);
};

// Ordered age options for dropdowns
export const AGE_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 1);
export const EDU_OPTIONS = Array.from({ length: 6 },  (_, i) => i + 1);
export const INC_OPTIONS = Array.from({ length: 8 },  (_, i) => i + 1);
export const GEN_HLTH_OPTIONS = Array.from({ length: 5 }, (_, i) => i + 1);
