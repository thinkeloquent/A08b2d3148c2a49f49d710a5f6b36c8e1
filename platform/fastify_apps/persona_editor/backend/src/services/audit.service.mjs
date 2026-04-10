/**
 * Audit Service
 * Business logic for audit log operations
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Create audit service with database models
 */
export function createAuditService(db) {
  const { AuditLog } = db;

  /**
   * Create an audit log entry
   */
  async function createLog(personaId, action, changes, userId = 'system', ipAddress = null) {
    const id = `audit-${uuidv4()}`;
    return AuditLog.create({
      id,
      persona_id: personaId,
      action,
      user_id: userId,
      changes: typeof changes === 'string' ? changes : JSON.stringify(changes),
      ip_address: ipAddress,
      timestamp: new Date(),
    });
  }

  /**
   * Get audit logs for a specific persona
   */
  async function getLogsForPersona(personaId, limit = 100) {
    return AuditLog.findAll({
      where: { persona_id: personaId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Get recent audit logs across all personas
   */
  async function getRecentLogs(limit = 100) {
    return AuditLog.findAll({
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  return {
    createLog,
    getLogsForPersona,
    getRecentLogs,
  };
}
