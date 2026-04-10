export function createLLMDefaultService(db) {
  const { LLMDefault } = db;

  return {
    async list() {
      return LLMDefault.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    },

    async getByCategory(category) {
      return LLMDefault.findAll({
        where: { category },
        order: [['name', 'ASC']],
      });
    },

    async getById(id) {
      const item = await LLMDefault.findByPk(id);
      if (!item) throw Object.assign(new Error('LLM default not found'), { statusCode: 404 });
      return item;
    },

    async create(data) {
      return LLMDefault.create(data);
    },

    async update(id, data) {
      const item = await LLMDefault.findByPk(id);
      if (!item) throw Object.assign(new Error('LLM default not found'), { statusCode: 404 });
      return item.update(data);
    },

    async remove(id) {
      const item = await LLMDefault.findByPk(id);
      if (!item) throw Object.assign(new Error('LLM default not found'), { statusCode: 404 });
      await item.destroy();
    },
  };
}
