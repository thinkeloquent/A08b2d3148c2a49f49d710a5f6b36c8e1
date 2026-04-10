/**
 * Generic seed-from-json script for all Sequelize apps.
 *
 * Dynamically loads models from the calling app's ./models/index.mjs,
 * reads a JSON file, and creates records for the specified model.
 *
 * Environment variables:
 *   JSON_FILE  (required) — Path to JSON file containing seed data.
 *   MODEL      (optional) — Sequelize model name. Required when the JSON
 *                           file is a flat array. Ignored when the JSON
 *                           uses the { model, data } object format.
 *
 * Supported JSON formats:
 *   1. Flat array:   [ { ... }, { ... } ]           — requires MODEL env var
 *   2. Object:       { "model": "Name", "data": [ { ... } ] }
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const JSON_FILE = process.env.JSON_FILE;
const MODEL = process.env.MODEL;

if (!JSON_FILE) {
  console.error('Usage: make seed-from-json JSON_FILE=path/to/data.json [MODEL=ModelName]');
  console.error('');
  console.error('  JSON_FILE  (required) Path to a JSON file with seed data.');
  console.error('  MODEL      (optional) Sequelize model name — required when JSON is a flat array.');
  process.exit(1);
}

async function seedFromJson() {
  const modelsPath = resolve(process.cwd(), 'models', 'index.mjs');
  const models = await import(pathToFileURL(modelsPath).href);
  const { sequelize, SCHEMA } = models;

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Read and parse JSON file
    const jsonPath = resolve(JSON_FILE);
    const raw = await readFile(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);

    // Determine model name and records
    let modelName, records;

    if (Array.isArray(parsed)) {
      if (!MODEL) {
        console.error('JSON file is a flat array — MODEL env var is required.');
        console.error('Available models:', Object.keys(sequelize.models).join(', '));
        process.exitCode = 1;
        return;
      }
      modelName = MODEL;
      records = parsed;
    } else if (parsed.model && Array.isArray(parsed.data)) {
      modelName = parsed.model;
      records = parsed.data;
    } else {
      console.error('Invalid JSON format. Expected one of:');
      console.error('  1. A flat array:  [ { ... }, { ... } ]');
      console.error('  2. An object:     { "model": "ModelName", "data": [ { ... } ] }');
      process.exitCode = 1;
      return;
    }

    // Find the model
    const TargetModel = sequelize.models[modelName];
    if (!TargetModel) {
      console.error(`Model "${modelName}" not found.`);
      console.error('Available models:', Object.keys(sequelize.models).join(', '));
      process.exitCode = 1;
      return;
    }

    // Seed records one at a time for per-row feedback
    let count = 0;
    for (const record of records) {
      const created = await TargetModel.create(record);
      count++;
      const label = record.name || record.title || record.label || created.id;
      console.log(`  [${count}/${records.length}] Created: ${label}`);
    }

    console.log(`\nSeeding complete. ${count} ${modelName} record(s) created.`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedFromJson();
