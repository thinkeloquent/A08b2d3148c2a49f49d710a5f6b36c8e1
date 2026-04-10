import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sequelize, SCHEMA, OWNED_TABLE_NAMES, CodeRepository, CodeRepositoryTag, CodeRepositoryMetadata } from './models/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, '..', '..', '..', 'common', 'data', 'repo.json');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Truncate existing data to allow re-seeding
    for (const table of OWNED_TABLE_NAMES) {
      await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }
    console.log('Existing data truncated.');

    const raw = await readFile(SEED_PATH, 'utf-8');
    const items = JSON.parse(raw);

    for (const item of items) {
      // Build external_ids from available URLs
      const external_ids = [];
      if (item.type === 'npm' && item.name) external_ids.push(['npm', item.name]);
      if (item.type === 'docker' && item.name) external_ids.push(['dockerhub', item.name]);
      if (item.type === 'python' && item.name) external_ids.push(['pypi', item.name]);
      if (item.githubUrl) {
        const match = item.githubUrl.match(/github\.com\/(.+)/);
        if (match) external_ids.push(['github', match[1]]);
      }

      const repo = await CodeRepository.create({
        name: item.name,
        description: item.description,
        type: item.type,
        github_url: item.githubUrl,
        package_url: item.packageUrl,
        stars: item.stars,
        forks: item.forks,
        version: item.version,
        maintainer: item.maintainer,
        last_updated: item.lastUpdated,
        trending: item.trending ?? false,
        verified: item.verified ?? false,
        language: item.language,
        license: item.license,
        size: item.size,
        dependencies: item.dependencies ?? null,
        health_score: item.healthScore,
        status: item.status,
        source: 'manual',
        external_ids,
      });

      if (item.tags?.length) {
        const tagInstances = await Promise.all(
          item.tags.map((tagName) =>
            CodeRepositoryTag.findOrCreate({ where: { name: tagName } }).then(([tag]) => tag)
          )
        );
        await repo.setTags(tagInstances);
      }

      if (item.documentation?.length) {
        await CodeRepositoryMetadata.bulkCreate(
          item.documentation.map((doc) => ({
            name: doc.name,
            repository_id: repo.id,
          }))
        );
      }

      console.log(`Seeded: ${item.name}`);
    }

    console.log(`\nSeeding complete. ${items.length} repositories loaded.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
