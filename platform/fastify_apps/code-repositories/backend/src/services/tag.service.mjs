/**
 * Tag Service
 * Business logic for CodeRepositoryTag CRUD operations
 */

/**
 * Create tag service with database models
 */
export function createTagService(db) {
  const { CodeRepositoryTag } = db;

  /**
   * List all tags
   */
  async function list() {
    return CodeRepositoryTag.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get tag by ID
   */
  async function getById(id) {
    return CodeRepositoryTag.findByPk(id);
  }

  /**
   * Get tag by name
   */
  async function getByName(name) {
    return CodeRepositoryTag.findOne({ where: { name } });
  }

  /**
   * Find or create a tag by name
   */
  async function findOrCreate(name) {
    const [tag, created] = await CodeRepositoryTag.findOrCreate({
      where: { name },
      defaults: { name },
    });
    return { tag, created };
  }

  /**
   * Create a new tag
   */
  async function create(data) {
    return CodeRepositoryTag.create(data);
  }

  /**
   * Update an existing tag
   */
  async function update(id, data) {
    const tag = await CodeRepositoryTag.findByPk(id);
    if (!tag) {
      return null;
    }
    await tag.update(data);
    return tag;
  }

  /**
   * Delete a tag
   */
  async function remove(id) {
    const tag = await CodeRepositoryTag.findByPk(id);
    if (!tag) {
      return false;
    }
    await tag.destroy();
    return true;
  }

  return {
    list,
    getById,
    getByName,
    findOrCreate,
    create,
    update,
    remove,
  };
}
