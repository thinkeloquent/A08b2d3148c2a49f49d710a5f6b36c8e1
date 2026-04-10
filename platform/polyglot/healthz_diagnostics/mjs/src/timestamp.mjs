/**
 * Consistent ISO8601 timestamp generation.
 * Output: YYYY-MM-DDTHH:MM:SSZ (no milliseconds)
 */
export class TimestampFormatter {
    /**
     * Return current UTC timestamp in ISO8601 format.
     * @returns {string} ISO8601 string
     */
    format() {
        return this.formatFromEpoch(Date.now());
    }

    /**
     * Format specific epoch timestamp.
     * @param {number} epochMs - Unix timestamp in milliseconds
     * @returns {string} ISO8601 string (e.g., "2024-01-15T10:30:00Z")
     */
    formatFromEpoch(epochMs) {
        const dt = new Date(epochMs);
        // Format as YYYY-MM-DDTHH:MM:SSZ
        // toISOString() returns "2024-01-15T10:30:00.000Z" usually
        // We need to strip milliseconds
        const iso = dt.toISOString();
        return iso.replace(/\.\d{3}Z$/, "Z");
    }
}
