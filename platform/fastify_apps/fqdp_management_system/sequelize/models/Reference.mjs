import { DataTypes } from "sequelize";
import { dbSchema } from '../../../../common/config/database_schema.mjs';

export default function defineReference(sequelize, schema) {
  const Reference = sequelize.define(
    "Reference",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      entityType: {
        type: DataTypes.ENUM(
          "organization",
          "workspace",
          "team",
          "application",
          "project",
          "resource",
        ),
        allowNull: false,
        field: "entity_type",
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "entity_id",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      link: {
        type: DataTypes.STRING(2048),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      externalUid: {
        type: DataTypes.STRING(512),
        allowNull: false,
        field: "external_uid",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "archived"),
        defaultValue: "active",
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING(255),
        defaultValue: "system",
        allowNull: false,
        field: "created_by",
      },
      updatedBy: {
        type: DataTypes.STRING(255),
        defaultValue: "system",
        allowNull: false,
        field: "updated_by",
      },
    },
    {
      tableName: dbSchema.tableName("fqdp_references"),
      schema: dbSchema.schemaFor(schema),
      ...dbSchema.defineDefaults,
      indexes: [
        {
          name: "idx_fqdp_ref_entity_uid_unique",
          unique: true,
          fields: ["entity_type", "entity_id", "external_uid"],
        },
        {
          name: "idx_fqdp_ref_entity",
          fields: ["entity_type", "entity_id"],
        },
        {
          name: "idx_fqdp_ref_external_uid",
          fields: ["external_uid"],
        },
      ],
      hooks: {
        beforeCreate(instance) {
          console.log(`[Reference] Creating: ${instance.name}`);
        },
        beforeUpdate(instance) {
          console.log(`[Reference] Updating: ${instance.name}`);
        },
      },
    },
  );

  Reference.prototype.toCleanJSON = function () {
    const values = this.get({ plain: true });
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };

  return Reference;
}
