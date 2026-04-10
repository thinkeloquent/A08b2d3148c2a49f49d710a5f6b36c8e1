import { Op } from 'sequelize';

export function createDatasourceService(db) {
  const { CsvDatasource, CsvDatasourceTag, CsvDatasourceLabel, CsvInstance } = db;

  async function findAll(options = {}) {
    const { page = 1, limit = 20, category, status, tagId, labelKey } = options;
    const offset = (page - 1) * limit;
    const where = {};
    const include = [
      { model: CsvDatasourceTag, as: 'tags', through: { attributes: [] } },
      { model: CsvDatasourceLabel, as: 'labels' },
    ];

    if (category) where.category = category;
    if (status) where.status = status;

    if (tagId) {
      include[0] = {
        model: CsvDatasourceTag,
        as: 'tags',
        through: { attributes: [] },
        where: { id: tagId },
        required: true,
      };
    }

    if (labelKey) {
      include[1] = {
        model: CsvDatasourceLabel,
        as: 'labels',
        where: { key: labelKey },
        required: true,
      };
    }

    const { count, rows } = await CsvDatasource.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order: [['created_at', 'DESC']],
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
    return CsvDatasource.findByPk(id, {
      include: [
        { model: CsvDatasourceTag, as: 'tags', through: { attributes: [] } },
        { model: CsvDatasourceLabel, as: 'labels' },
        {
          model: CsvInstance,
          as: 'instances',
          attributes: ['id', 'label', 'file_name', 'row_count', 'status', 'instance_date', 'created_at'],
          order: [['instance_date', 'DESC']],
        },
      ],
    });
  }

  async function create(data) {
    return CsvDatasource.create(data);
  }

  async function update(id, data) {
    const ds = await CsvDatasource.findByPk(id);
    if (!ds) return null;
    await ds.update(data);
    return ds;
  }

  async function archive(id) {
    const ds = await CsvDatasource.findByPk(id);
    if (!ds) return null;
    await ds.update({ status: 'archived' });
    return ds;
  }

  async function setTags(id, tagIds) {
    const ds = await CsvDatasource.findByPk(id);
    if (!ds) return null;
    const tags = await CsvDatasourceTag.findAll({ where: { id: { [Op.in]: tagIds } } });
    await ds.setTags(tags);
    return findById(id);
  }

  async function setLabels(id, labels) {
    const ds = await CsvDatasource.findByPk(id);
    if (!ds) return null;

    // Remove existing labels and replace
    await CsvDatasourceLabel.destroy({ where: { datasource_id: id } });
    if (labels && labels.length > 0) {
      await CsvDatasourceLabel.bulkCreate(
        labels.map((l) => ({ datasource_id: id, key: l.key, value: l.value })),
      );
    }
    return findById(id);
  }

  async function destroy(id) {
    const ds = await CsvDatasource.findByPk(id);
    if (!ds) return null;
    await CsvDatasourceLabel.destroy({ where: { datasource_id: id } });
    await ds.setTags([]);
    await ds.destroy();
    return { id };
  }

  async function distinctCategories() {
    const rows = await CsvDatasource.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      where: { status: 'active' },
      raw: true,
    });
    return rows.map((r) => r.category).filter(Boolean);
  }

  return { findAll, findById, create, update, archive, destroy, setTags, setLabels, distinctCategories };
}
