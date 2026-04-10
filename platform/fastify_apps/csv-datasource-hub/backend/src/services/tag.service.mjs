export function createTagService(db) {
  const { CsvDatasourceTag } = db;

  async function list() {
    return CsvDatasourceTag.findAll({ order: [['name', 'ASC']] });
  }

  async function create(data) {
    return CsvDatasourceTag.create(data);
  }

  async function findOrCreate(name) {
    const [tag, created] = await CsvDatasourceTag.findOrCreate({
      where: { name },
      defaults: { name },
    });
    return { tag, created };
  }

  async function update(id, data) {
    const tag = await CsvDatasourceTag.findByPk(id);
    if (!tag) return null;
    await tag.update(data);
    return tag;
  }

  async function remove(id) {
    const tag = await CsvDatasourceTag.findByPk(id);
    if (!tag) return false;
    await tag.destroy();
    return true;
  }

  return { list, create, findOrCreate, update, remove };
}
