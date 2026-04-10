export function createPersonaService(db) {
  const { Persona } = db;

  return {
    async list() {
      return Persona.findAll({ order: [['created_at', 'DESC']] });
    },

    async getById(id) {
      const persona = await Persona.findByPk(id);
      if (!persona) throw Object.assign(new Error('Persona not found'), { statusCode: 404 });
      return persona;
    },

    async create(data) {
      return Persona.create(data);
    },

    async update(id, data) {
      const persona = await Persona.findByPk(id);
      if (!persona) throw Object.assign(new Error('Persona not found'), { statusCode: 404 });
      return persona.update(data);
    },

    async remove(id) {
      const persona = await Persona.findByPk(id);
      if (!persona) throw Object.assign(new Error('Persona not found'), { statusCode: 404 });
      await persona.destroy();
    },
  };
}
