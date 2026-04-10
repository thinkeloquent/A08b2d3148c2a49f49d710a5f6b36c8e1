/**
 * Tag Service
 * Business logic for ComponentTag CRUD operations
 */

/**
 * Create tag service with database models
 */
export function createTagService(db) {
  const { ComponentTag } = db;

  /**
   * List all tags
   */
  async function list() {
    return ComponentTag.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get tag by ID
   */
  async function getById(id) {
    return ComponentTag.findByPk(id);
  }

  /**
   * Create a new tag
   */
  async function create(data) {
    return ComponentTag.create(data);
  }

  /**
   * Update an existing tag
   */
  async function update(id, data) {
    const tag = await ComponentTag.findByPk(id);
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
    const tag = await ComponentTag.findByPk(id);
    if (!tag) {
      return false;
    }
    await tag.destroy();
    return true;
  }

  return {
    list,
    getById,
    create,
    update,
    remove,
  };
}
