/**
 * LLM Default Service
 * Business logic for LLMDefault CRUD operations
 */

import { nanoid } from 'nanoid';

/**
 * Create LLM default service with database models
 */
export function createLLMDefaultService(db) {
  const { LLMDefault } = db;

  /**
   * List all defaults ordered by category and name
   */
  async function findAll() {
    return LLMDefault.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
  }

  /**
   * Get defaults by category
   */
  async function findByCategory(category) {
    return LLMDefault.findAll({
      where: { category },
      order: [['name', 'ASC']],
    });
  }

  /**
   * Get default by ID
   */
  async function findById(id) {
    return LLMDefault.findByPk(id);
  }

  /**
   * Create a new default
   */
  async function create(data) {
    const id = nanoid(12);
    return LLMDefault.create({
      id,
      ...data,
    });
  }

  /**
   * Update an existing default (cannot change category)
   */
  async function update(id, data) {
    const llmDefault = await LLMDefault.findByPk(id);
    if (!llmDefault) {
      return null;
    }

    // Prevent category change
    const { category, ...updateData } = data;
    await llmDefault.update(updateData);

    return llmDefault;
  }

  /**
   * Delete a default
   */
  async function remove(id) {
    const llmDefault = await LLMDefault.findByPk(id);
    if (!llmDefault) {
      return false;
    }

    await llmDefault.destroy();
    return true;
  }

  /**
   * Unset all defaults in a category (before setting a new default)
   */
  async function unsetDefaultsInCategory(category) {
    await LLMDefault.update(
      { is_default: false },
      { where: { category, is_default: true } }
    );
  }

  return {
    findAll,
    findByCategory,
    findById,
    create,
    update,
    remove,
    unsetDefaultsInCategory,
  };
}
