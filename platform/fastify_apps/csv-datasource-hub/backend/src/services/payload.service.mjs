import { Op, literal } from 'sequelize';
import Papa from 'papaparse';

export function createPayloadService(db) {
  const { sequelize, CsvPayload, CsvInstance } = db;

  async function findByInstance(instanceId, options = {}) {
    const { offset = 0, limit = 50 } = options;

    const { count, rows } = await CsvPayload.findAndCountAll({
      where: { instance_id: instanceId },
      limit,
      offset,
      order: [['row_index', 'ASC']],
    });

    return {
      items: rows,
      total: count,
      offset,
      limit,
    };
  }

  async function getColumns(instanceId) {
    const instance = await CsvInstance.findByPk(instanceId);
    if (!instance) return null;
    return instance.column_headers || [];
  }

  async function search(instanceId, options = {}) {
    const { filters = {}, offset = 0, limit = 50 } = options;
    const where = { instance_id: instanceId };

    // Build JSONB filters: data->>'col' ILIKE '%val%'
    for (const [col, val] of Object.entries(filters)) {
      if (val) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
          literal(`"data"->>'${col.replace(/'/g, "''")}' ILIKE '%${String(val).replace(/'/g, "''")}%'`),
        );
      }
    }

    const { count, rows } = await CsvPayload.findAndCountAll({
      where,
      limit,
      offset,
      order: [['row_index', 'ASC']],
    });

    return {
      items: rows,
      total: count,
      offset,
      limit,
    };
  }

  async function exportAll(instanceId, options = {}) {
    const { offset, limit } = options;
    const isPaginated = offset != null && limit != null;

    if (isPaginated) {
      const { count, rows } = await CsvPayload.findAndCountAll({
        where: { instance_id: instanceId },
        order: [['row_index', 'ASC']],
        attributes: ['row_index', 'data'],
        offset,
        limit,
        raw: true,
      });
      return { rows, total: count, offset, limit };
    }

    const rows = await CsvPayload.findAll({
      where: { instance_id: instanceId },
      order: [['row_index', 'ASC']],
      attributes: ['row_index', 'data'],
      raw: true,
    });
    return { rows, total: rows.length, offset: 0, limit: rows.length };
  }

  /**
   * Upsert CSV data into an existing instance.
   * Rows matching on `matchColumns` are updated; non-matching rows are inserted.
   * Returns { updated, inserted, skipped, newRowCount }.
   */
  async function upsertFromCsv(instanceId, { fileBuffer, matchColumns }) {
    const instance = await CsvInstance.findByPk(instanceId);
    if (!instance) {
      const err = new Error(`Instance not found: ${instanceId}`);
      err.statusCode = 404;
      throw err;
    }

    if (!matchColumns || matchColumns.length === 0) {
      const err = new Error('At least one match column is required for upsert');
      err.statusCode = 400;
      throw err;
    }

    const csvText = fileBuffer.toString('utf-8');
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      const err = new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
      err.statusCode = 422;
      throw err;
    }

    const incomingHeaders = parsed.meta.fields || [];
    const existingHeaders = instance.column_headers || [];

    // Validate that match columns exist in both the uploaded CSV and the instance
    for (const col of matchColumns) {
      if (!incomingHeaders.includes(col)) {
        const err = new Error(`Match column "${col}" not found in uploaded CSV`);
        err.statusCode = 422;
        throw err;
      }
      if (!existingHeaders.includes(col)) {
        const err = new Error(`Match column "${col}" not found in existing instance columns`);
        err.statusCode = 422;
        throw err;
      }
    }

    const incomingRows = parsed.data;
    let updated = 0;
    let inserted = 0;
    let skipped = 0;

    // Get current max row_index for new inserts
    const maxResult = await CsvPayload.max('row_index', {
      where: { instance_id: instanceId },
    });
    let nextRowIndex = (maxResult ?? -1) + 1;

    const transaction = await sequelize.transaction();
    try {
      for (const row of incomingRows) {
        // Build WHERE clause for match columns using JSONB operators
        const where = { instance_id: instanceId };
        const andClauses = matchColumns.map((col) => {
          const safeCol = col.replace(/'/g, "''");
          const safeVal = String(row[col] ?? '').replace(/'/g, "''");
          return literal(`"data"->>'${safeCol}' = '${safeVal}'`);
        });
        where[Op.and] = andClauses;

        const existing = await CsvPayload.findOne({ where, transaction });

        if (existing) {
          // Merge: overwrite existing data keys with incoming row values
          const merged = { ...existing.data, ...row };
          await existing.update({ data: merged }, { transaction });
          updated++;
        } else {
          await CsvPayload.create({
            instance_id: instanceId,
            row_index: nextRowIndex++,
            data: row,
          }, { transaction });
          inserted++;
        }
      }

      // Merge any new column headers from the uploaded CSV
      const mergedHeaders = [...new Set([...existingHeaders, ...incomingHeaders])];
      const newRowCount = instance.row_count + inserted;
      await instance.update({
        row_count: newRowCount,
        column_count: mergedHeaders.length,
        column_headers: mergedHeaders,
      }, { transaction });

      await transaction.commit();

      return { updated, inserted, skipped, newRowCount, columns: mergedHeaders };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return { findByInstance, getColumns, search, exportAll, upsertFromCsv };
}
