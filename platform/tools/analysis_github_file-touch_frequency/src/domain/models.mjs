/**
 * File touch frequency (knowledge entropy) classification thresholds.
 *
 * A file is a "hotspot" when it appears in more commits than the hotspot threshold.
 *
 * Health is based on the maximum file frequency across the codebase:
 *   Ideally no single file should appear in more than 10% of commits.
 */
export const HOTSPOT_HEALTH = {
  EXCELLENT: { max: 5, label: "excellent" },
  HEALTHY: { max: 10, label: "healthy" },
  MODERATE: { max: 20, label: "moderate" },
  CONCERNING: { max: 35, label: "concerning" },
  CRITICAL: { max: Infinity, label: "critical" },
};

/**
 * Frequency tiers for file classification.
 * Based on percentage of total commits a file appears in.
 */
export const FREQUENCY_TIERS = {
  RARE: { maxFreq: 2, label: "rare (<2%)" },
  OCCASIONAL: { maxFreq: 5, label: "occasional (2-5%)" },
  FREQUENT: { maxFreq: 15, label: "frequent (5-15%)" },
  VERY_FREQUENT: { maxFreq: 30, label: "very frequent (15-30%)" },
  HOTSPOT: { maxFreq: Infinity, label: "hotspot (30%+)" },
};

/**
 * Default thresholds for hotspot classification.
 */
export const DEFAULT_HOTSPOT_THRESHOLD = 10;
export const DEFAULT_TOP_FILES_LIMIT = 50;
