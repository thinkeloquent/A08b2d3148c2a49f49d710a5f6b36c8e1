/**
 * Persona Service
 * Business logic for Persona CRUD operations
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Create persona service with database models
 */
export function createPersonaService(db) {
  const { sequelize, Persona, AuditLog } = db;

  /**
   * List all personas ordered by last_updated
   */
  async function findAll() {
    return Persona.findAll({
      order: [['last_updated', 'DESC']],
    });
  }

  /**
   * Get persona by ID with optional audit logs
   */
  async function findById(id, options = {}) {
    const { includeAuditLogs = false } = options;
    const include = [];

    if (includeAuditLogs) {
      include.push({
        model: AuditLog,
        as: 'auditLogs',
        limit: 10,
        order: [['timestamp', 'DESC']],
      });
    }

    return Persona.findByPk(id, { include });
  }

  /**
   * Create a new persona
   */
  async function create(data) {
    const id = `persona-${uuidv4()}`;
    return Persona.create({
      id,
      ...data,
      last_updated: new Date(),
    });
  }

  /**
   * Update an existing persona
   */
  async function update(id, data) {
    const persona = await Persona.findByPk(id);
    if (!persona) {
      return null;
    }

    await persona.update({
      ...data,
      last_updated: new Date(),
    });

    return persona;
  }

  /**
   * Delete a persona (cascade deletes audit logs)
   */
  async function remove(id) {
    const persona = await Persona.findByPk(id);
    if (!persona) {
      return false;
    }

    await persona.destroy();
    return true;
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove,
  };
}
