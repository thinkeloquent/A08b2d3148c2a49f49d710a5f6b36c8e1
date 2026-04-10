/**
 * Shared Sequelize Error Utilities
 *
 * Helpers for detecting and handling missing database tables gracefully.
 */

/**
 * Detect if an error is caused by a missing database table.
 * Checks PostgreSQL error code 42P01 and message pattern.
 *
 * @param {Error} error - The error to check
 * @returns {{ tableName: string } | null} - Table info if missing table detected, null otherwise
 */
export function detectMissingTable(error) {
  // Check the error itself or the original Sequelize error
  const pgError = error.original || error.parent || error;

  if (pgError.code === '42P01') {
    const match = pgError.message?.match(/relation "([^"]+)" does not exist/);
    return { tableName: match ? match[1] : 'unknown' };
  }

  // Also check the message directly for cases where code is not available
  if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
    const match = error.message.match(/relation "([^"]+)" does not exist/);
    return { tableName: match ? match[1] : 'unknown' };
  }

  return null;
}

/**
 * Build a structured 503 response body for a missing table error.
 *
 * @param {string} tableName - The missing table name
 * @param {string} appName - The app that encountered the error
 * @returns {object} - Structured response body
 */
export function buildMissingTableResponse(tableName, appName) {
  return {
    error: 'ServiceUnavailable',
    message: `Database table "${tableName}" does not exist. Run the setup script for ${appName} to create the required tables.`,
    statusCode: 503,
    details: {
      missingTable: tableName,
      app: appName,
      suggestion: `Run the setup/migration script for ${appName} to initialize the database schema.`,
    },
  };
}
