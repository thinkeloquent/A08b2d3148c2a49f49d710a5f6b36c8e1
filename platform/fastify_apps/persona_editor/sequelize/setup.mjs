import { sequelize, SCHEMA, OWNED_MODELS } from './models/index.mjs';

async function setup() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Ensure ENUM types are up-to-date (ALTER TYPE is idempotent with IF NOT EXISTS)
    const enumUpdates = [
      `ALTER TYPE "enum_persona_editor_llm_defaults_category" ADD VALUE IF NOT EXISTS 'providers'`,
    ];
    for (const sql of enumUpdates) {
      try {
        await sequelize.query(sql);
      } catch {
        // Ignore if enum value already exists or type doesn't exist yet
      }
    }

    // Migrate role/tone columns from ENUM to VARCHAR to allow dynamic values from llm-defaults
    const columnMigrations = [
      { column: 'role', enumType: 'enum_persona_editor_personas_role' },
      { column: 'tone', enumType: 'enum_persona_editor_personas_tone' },
    ];
    for (const { column, enumType } of columnMigrations) {
      try {
        // Check if column is still an ENUM by trying the ALTER
        await sequelize.query(`
          ALTER TABLE "persona_editor_personas"
            ALTER COLUMN "${column}" TYPE VARCHAR(50)
            USING "${column}"::VARCHAR(50);
        `);
        await sequelize.query(`ALTER TABLE "persona_editor_personas" ALTER COLUMN "${column}" DROP NOT NULL;`);
        await sequelize.query(`DROP TYPE IF EXISTS "${enumType}";`);
        console.log(`Migrated ${column} from ENUM to VARCHAR(50)`);
      } catch {
        // Already migrated or column doesn't exist
      }
    }

    // Drop FK on audit_logs.persona_id so logs survive persona deletion with ID intact
    try {
      const [fks] = await sequelize.query(`
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'persona_editor_audit_logs'
          AND constraint_type = 'FOREIGN KEY';
      `);
      for (const { constraint_name } of fks) {
        await sequelize.query(`
          ALTER TABLE "persona_editor_audit_logs"
            DROP CONSTRAINT "${constraint_name}";
        `);
        console.log(`Dropped FK constraint ${constraint_name} on audit_logs`);
      }
      // Restore NOT NULL (may have been dropped by prior migration)
      await sequelize.query(`
        ALTER TABLE "persona_editor_audit_logs"
          ALTER COLUMN "persona_id" SET NOT NULL;
      `);
    } catch {
      // Already migrated or table doesn't exist yet
    }

    // Add persona_prompt column if missing (legacy, kept for migration safety)
    try {
      await sequelize.query(`
        ALTER TABLE "persona_editor_personas"
          ADD COLUMN IF NOT EXISTS "persona_prompt" TEXT DEFAULT NULL;
      `);
    } catch {
      // Column already exists or table doesn't exist yet
    }

    // Add persona_prompt_data and persona_prompt_template columns if missing
    try {
      await sequelize.query(`
        ALTER TABLE "persona_editor_personas"
          ADD COLUMN IF NOT EXISTS "persona_prompt_data" JSONB DEFAULT NULL;
      `);
      await sequelize.query(`
        ALTER TABLE "persona_editor_personas"
          ADD COLUMN IF NOT EXISTS "persona_prompt_template" TEXT DEFAULT NULL;
      `);
    } catch {
      // Columns already exist or table doesn't exist yet
    }

    // Add context column to llm_defaults if missing
    try {
      await sequelize.query(`
        ALTER TABLE "persona_editor_llm_defaults"
          ADD COLUMN IF NOT EXISTS "context" JSONB DEFAULT NULL;
      `);
    } catch {
      // Column already exists or table doesn't exist yet
    }

    // Only sync models owned by this schema
    for (const model of OWNED_MODELS) {
      await model.sync({ force: false });
    }

    console.log('Tables created successfully (persona_editor schema only).');
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

setup();
