import { Op } from 'sequelize';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 422;
  }
}

export function createCategoryService(db) {
  const { Category, CategoryType, TargetApp } = db;

  async function listCategoryTypes() {
    return CategoryType.findAll({ order: [['name', 'ASC']] });
  }

  async function listTargetApps() {
    return TargetApp.findAll({ order: [['name', 'ASC']] });
  }

  /**
   * Validate that category_type_id and target_app_id exist in their
   * respective lookup tables. Throws ValidationError with details
   * about which FK(s) are invalid.
   */
  async function validateForeignKeys({ category_type_id, target_app_id }) {
    const checks = [];

    if (category_type_id !== undefined) {
      checks.push(
        CategoryType.findByPk(category_type_id).then((row) => {
          if (!row) return `category_type_id "${category_type_id}" does not match any Category Type`;
          return null;
        }),
      );
    }

    if (target_app_id !== undefined) {
      checks.push(
        TargetApp.findByPk(target_app_id).then((row) => {
          if (!row) return `target_app_id "${target_app_id}" does not match any Target Application`;
          return null;
        }),
      );
    }

    const errors = (await Promise.all(checks)).filter(Boolean);
    if (errors.length > 0) {
      throw new ValidationError(errors.join("; "));
    }
  }

  async function listCategories({ category_type_id, category_type_name, target_app_id, target_app_name } = {}) {
    const where = {};
    if (category_type_id) {
      where.category_type_id = category_type_id;
    } else if (category_type_name) {
      const ct = await CategoryType.findOne({ where: { name: { [Op.iLike]: category_type_name } } });
      if (!ct) return [];
      where.category_type_id = ct.id;
    }
    if (target_app_id) {
      where.target_app_id = target_app_id;
    } else if (target_app_name) {
      const ta = await TargetApp.findOne({ where: { name: { [Op.iLike]: target_app_name } } });
      if (!ta) return [];
      where.target_app_id = ta.id;
    }

    return Category.findAll({
      where,
      include: [
        { model: CategoryType, as: 'categoryType' },
        { model: TargetApp, as: 'targetApp' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async function searchCategories(q) {
    const pattern = `%${q}%`;
    return Category.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: pattern } },
          { description: { [Op.iLike]: pattern } },
        ],
      },
      include: [
        { model: CategoryType, as: 'categoryType' },
        { model: TargetApp, as: 'targetApp' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async function getCategoryById(id) {
    return Category.findByPk(id, {
      include: [
        { model: CategoryType, as: 'categoryType' },
        { model: TargetApp, as: 'targetApp' },
      ],
    });
  }

  async function createCategory(data) {
    await validateForeignKeys(data);
    const category = await Category.create(data);
    return getCategoryById(category.id);
  }

  async function updateCategory(id, data) {
    const category = await Category.findByPk(id);
    if (!category) return null;
    await validateForeignKeys(data);
    await category.update(data);
    return getCategoryById(id);
  }

  async function deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) return false;
    await category.destroy();
    return true;
  }

  async function createCategoryType(data) {
    return CategoryType.create(data);
  }

  async function createTargetApp(data) {
    return TargetApp.create(data);
  }

  return {
    listCategoryTypes,
    listTargetApps,
    listCategories,
    searchCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    createCategoryType,
    createTargetApp,
  };
}
