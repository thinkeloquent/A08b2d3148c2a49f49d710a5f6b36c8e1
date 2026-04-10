# Group Role Management Sequelize Database

## Overview

Sequelize ORM models and database management scripts for PostgreSQL.

## Technology Stack

- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Connection**: @internal/db_connection_sequelize

## Directory Structure

```
sequelize/
├── models/                    # Sequelize model definitions
│   ├── index.mjs              # Model exports and associations
│   ├── CodeRepository.mjs     # Main entity model
│   ├── CodeRepositoryTag.mjs  # Tag join table
│   └── CodeRepositoryMetadata.mjs # Metadata model
├── connection-test.mjs        # Test database connection
├── setup.mjs                  # Initialize schema
├── teardown.mjs               # Drop tables
├── seed.mjs                   # Populate sample data
└── package.json
```

## Scripts

```bash
# Test database connection
pnpm run connection-test

# Initialize database schema
pnpm run setup

# Drop all tables
pnpm run teardown

# Seed sample data
pnpm run seed

# Full reset (teardown + setup + seed)
pnpm run reset
```

## Model Definitions

### Base Model Pattern
```javascript
// models/CodeRepository.mjs
import { DataTypes } from 'sequelize';

export default function defineCodeRepository(sequelize) {
  return sequelize.define('CodeRepository', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('git', 'svn', 'mercurial'),
      defaultValue: 'git',
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active',
    },
    url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
  }, {
    tableName: 'group_role_management_repositories',
    timestamps: true,
    underscored: true,
  });
}
```

### Association Pattern
```javascript
// models/index.mjs
import defineCodeRepository from './CodeRepository.mjs';
import defineCodeRepositoryTag from './CodeRepositoryTag.mjs';
import defineCodeRepositoryMetadata from './CodeRepositoryMetadata.mjs';

export function initializeModels(sequelize) {
  const CodeRepository = defineCodeRepository(sequelize);
  const Tag = defineCodeRepositoryTag(sequelize);
  const Metadata = defineCodeRepositoryMetadata(sequelize);

  // Many-to-many: Repository <-> Tag
  CodeRepository.belongsToMany(Tag, {
    through: 'group_role_management_repository_tags',
    foreignKey: 'repository_id',
  });
  Tag.belongsToMany(CodeRepository, {
    through: 'group_role_management_repository_tags',
    foreignKey: 'tag_id',
  });

  // One-to-many: Repository -> Metadata
  CodeRepository.hasMany(Metadata, {
    foreignKey: 'repository_id',
    as: 'metadata',
  });
  Metadata.belongsTo(CodeRepository, {
    foreignKey: 'repository_id',
  });

  return { CodeRepository, Tag, Metadata };
}
```

## Database Connection

```javascript
// Uses shared connection from workspace
import { getConnection } from '@internal/db_connection_sequelize';

const sequelize = await getConnection({
  database: 'group_role_management',
});

const models = initializeModels(sequelize);
```

## Setup Script Pattern

```javascript
// setup.mjs
import { getConnection } from '@internal/db_connection_sequelize';
import { initializeModels } from './models/index.mjs';

async function setup() {
  const sequelize = await getConnection();
  const models = initializeModels(sequelize);

  // Sync all models (create tables)
  await sequelize.sync({ force: false });

  console.log('Database schema initialized');
  await sequelize.close();
}

setup().catch(console.error);
```

## Seed Script Pattern

```javascript
// seed.mjs
async function seed() {
  const sequelize = await getConnection();
  const { CodeRepository, Tag } = initializeModels(sequelize);

  // Create sample tags
  const [jsTag] = await Tag.findOrCreate({
    where: { name: 'javascript' },
  });

  // Create sample repository
  const repo = await CodeRepository.create({
    name: 'sample-repo',
    description: 'A sample repository',
    type: 'git',
  });

  // Associate tags
  await repo.addTag(jsTag);

  console.log('Sample data seeded');
  await sequelize.close();
}
```

## Best Practices

1. **Use UUID primary keys**: Better for distributed systems
2. **Enable timestamps**: `createdAt`, `updatedAt` automatic
3. **Use underscored**: Snake_case column names
4. **Prefix table names**: With `group_role_management_` for namespacing
5. **Define associations in index.mjs**: Keep models focused on fields

## Adding New Models

1. Create `models/NewEntity.mjs` with define function
2. Import and call define in `models/index.mjs`
3. Add associations if needed
4. Run `pnpm run setup` to create table
5. Update `seed.mjs` with sample data

## Related Components

- Consumed by: `../backend`
- Schema matches: `../protobuf/proto/*.proto`
