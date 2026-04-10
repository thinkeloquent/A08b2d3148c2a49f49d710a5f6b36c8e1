import Papa from 'papaparse';

export function createInstanceService(db) {
  const { sequelize, CsvInstance, CsvPayload, CsvDatasource } = db;

  async function findByDatasource(datasourceId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await CsvInstance.findAndCountAll({
      where: { datasource_id: datasourceId },
      limit,
      offset,
      order: [['instance_date', 'DESC'], ['created_at', 'DESC']],
      distinct: true,
    });

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async function findById(id) {
    return CsvInstance.findByPk(id, {
      include: [{ association: 'datasource', attributes: ['id', 'name', 'category'] }],
    });
  }

  async function createFromUpload(datasourceId, { label, instanceDate, fileBuffer, fileName }) {
    const ds = await CsvDatasource.findByPk(datasourceId);
    if (!ds) {
      const err = new Error(`Datasource not found: ${datasourceId}`);
      err.statusCode = 404;
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

    const headers = parsed.meta.fields || [];
    const rows = parsed.data;

    const transaction = await sequelize.transaction();
    try {
      const instance = await CsvInstance.create({
        datasource_id: datasourceId,
        label: label || fileName,
        file_name: fileName,
        file_size_bytes: fileBuffer.length,
        row_count: rows.length,
        column_count: headers.length,
        instance_date: instanceDate || null,
        status: 'processing',
        column_headers: headers,
      }, { transaction });

      // Bulk insert payloads in batches of 500
      const BATCH_SIZE = 500;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE).map((row, idx) => ({
          instance_id: instance.id,
          row_index: i + idx,
          data: row,
        }));
        await CsvPayload.bulkCreate(batch, { transaction });
      }

      await instance.update({ status: 'ready' }, { transaction });
      await transaction.commit();

      return instance.reload();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async function remove(id) {
    const instance = await CsvInstance.findByPk(id);
    if (!instance) return false;
    await instance.destroy();
    return true;
  }

  return { findByDatasource, findById, createFromUpload, remove };
}
