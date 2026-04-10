import { DataTypes } from 'sequelize';
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineAuditLog(sequelize, schema) {
  const AuditLog = sequelize.define('AuditLog', {
    // Primary Key
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: 'Format: audit-{uuid}'
    },

    // Audit Metadata
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    persona_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Reference to persona (no FK — survives persona deletion)'
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'system'
    },
    changes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON-serialized changes object'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IPv4 or IPv6 address'
    }
  }, {
    tableName: dbSchema.tableName('persona_editor_audit_logs'),
    schema: dbSchema.schemaFor(schema),
    ...dbSchema.defineDefaults,
    timestamps: false,
    indexes: [
      { fields: ['persona_id'] },
      { fields: ['timestamp'] },
      { fields: ['action'] },
      { fields: ['persona_id', 'timestamp'], name: 'idx_audit_persona_timestamp' },
      { fields: ['action', 'timestamp'], name: 'idx_audit_action_timestamp' }
    ]
  });

  return AuditLog;
}
