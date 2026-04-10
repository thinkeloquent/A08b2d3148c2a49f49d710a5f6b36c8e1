import { Op } from "sequelize";

import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
  ListTemplatesQuerySchema,
} from "../zod-schema-contract/templates/index.mjs";
import { NotFoundError } from "../plugins/error-handler.mjs";

export function createTemplateRepository(db) {
  const { sequelize, Template, Step } = db;

  async function create(data, transaction) {
    const validData = validateSchema(
      CreateTemplateSchema,
      data,
      "Invalid template creation data",
    );

    const t = transaction || (await sequelize.transaction());

    try {
      const template = await Template.create(
        {
          template_id: validData.templateId,
          name: validData.name,
          description: validData.description || null,
          category: validData.category,
          version: 1,
        },
        { transaction: t },
      );

      await Promise.all(
        validData.steps.map((step) =>
          Step.create(
            {
              step_id: step.stepId,
              template_id: validData.templateId,
              order: step.order,
              title: step.title,
              description: step.description || null,
              required: step.required,
              tags: step.tags,
              dependencies: step.dependencies || [],
            },
            { transaction: t },
          ),
        ),
      );

      if (!transaction) await t.commit();

      return findByTemplateId(validData.templateId);
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  }

  async function findByTemplateId(templateId) {
    if (typeof templateId !== "string" || !templateId) {
      throw new Error("Invalid template ID");
    }

    return Template.findOne({
      where: { template_id: templateId },
      include: [{ model: Step, as: "steps", required: false }],
      order: [[{ model: Step, as: "steps" }, "order", "ASC"]],
    });
  }

  async function findAll(query) {
    const validQuery = validateSchema(
      ListTemplatesQuerySchema,
      query,
      "Invalid query parameters",
    );

    const { page, limit, category, search, sortBy, sortOrder } = validQuery;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Template.findAndCountAll({
      where,
      include: [{ model: Step, as: "steps", required: false }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
      distinct: true,
    });

    return { templates: rows, total: count };
  }

  async function update(templateId, data, transaction) {
    if (typeof templateId !== "string" || !templateId) {
      throw new Error("Invalid template ID");
    }
    const validData = validateSchema(
      UpdateTemplateSchema,
      data,
      "Invalid template update data",
    );

    const t = transaction || (await sequelize.transaction());

    try {
      const template = await Template.findOne({
        where: { template_id: templateId },
        transaction: t,
      });

      if (!template) {
        throw new NotFoundError(`Template with ID ${templateId} not found`);
      }

      if (validData.name) template.name = validData.name;
      if (validData.description !== undefined)
        template.description = validData.description;
      if (validData.category) template.category = validData.category;
      template.version += 1;

      await template.save({ transaction: t });

      if (validData.steps) {
        await Step.destroy({
          where: { template_id: templateId },
          transaction: t,
        });

        await Promise.all(
          validData.steps.map((step) =>
            Step.create(
              {
                step_id: step.stepId,
                template_id: templateId,
                order: step.order,
                title: step.title,
                description: step.description || null,
                required: step.required,
                tags: step.tags,
                dependencies: step.dependencies || [],
              },
              { transaction: t },
            ),
          ),
        );
      }

      if (!transaction) await t.commit();

      return findByTemplateId(templateId);
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  }

  async function remove(templateId, transaction) {
    if (typeof templateId !== "string" || !templateId) {
      throw new Error("Invalid template ID");
    }

    const t = transaction || (await sequelize.transaction());

    try {
      const template = await Template.findOne({
        where: { template_id: templateId },
        transaction: t,
      });

      if (!template) {
        throw new NotFoundError(`Template with ID ${templateId} not found`);
      }

      await template.destroy({ transaction: t });

      if (!transaction) await t.commit();
      return true;
    } catch (error) {
      if (!transaction) await t.rollback();
      throw error;
    }
  }

  async function exists(templateId) {
    if (typeof templateId !== "string" || !templateId) return false;
    const count = await Template.count({
      where: { template_id: templateId },
    });
    return count > 0;
  }

  return { create, findByTemplateId, findAll, update, remove, exists };
}
