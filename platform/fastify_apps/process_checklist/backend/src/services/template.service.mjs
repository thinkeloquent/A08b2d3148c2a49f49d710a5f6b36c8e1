import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
} from "../zod-schema-contract/templates/index.mjs";
import { ConflictError, NotFoundError } from "../plugins/error-handler.mjs";
import { createTemplateRepository } from "../repositories/template.repository.mjs";

export function createTemplateService(db) {
  const repo = createTemplateRepository(db);

  async function createTemplate(data) {
    const validData = validateSchema(
      CreateTemplateSchema,
      data,
      "Invalid template data",
    );

    const exists = await repo.exists(validData.templateId);
    if (exists) {
      throw new ConflictError(
        `Template with ID ${validData.templateId} already exists`,
      );
    }

    // Validate unique step IDs
    const stepIds = validData.steps.map((s) => s.stepId);
    if (stepIds.length !== new Set(stepIds).size) {
      throw new ConflictError("Step IDs must be unique within a template");
    }

    // Validate sequential step ordering
    const sorted = [...validData.steps].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].order !== i + 1) {
        throw new ConflictError(
          "Steps must have sequential ordering starting from 1",
        );
      }
    }

    return repo.create(validData);
  }

  async function getTemplate(templateId) {
    const template = await repo.findByTemplateId(templateId);
    if (!template) {
      throw new NotFoundError(`Template with ID ${templateId} not found`);
    }
    return template;
  }

  async function listTemplates(query) {
    const { templates, total } = await repo.findAll(query);
    const page = query.page || 1;
    const limit = query.limit || 20;

    return {
      templates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async function updateTemplate(templateId, data) {
    const validData = validateSchema(
      UpdateTemplateSchema,
      data,
      "Invalid template update data",
    );

    const exists = await repo.exists(templateId);
    if (!exists) {
      throw new NotFoundError(`Template with ID ${templateId} not found`);
    }

    if (validData.steps) {
      const stepIds = validData.steps.map((s) => s.stepId);
      if (stepIds.length !== new Set(stepIds).size) {
        throw new ConflictError("Step IDs must be unique within a template");
      }

      const sorted = [...validData.steps].sort((a, b) => a.order - b.order);
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].order !== i + 1) {
          throw new ConflictError(
            "Steps must have sequential ordering starting from 1",
          );
        }
      }
    }

    return repo.update(templateId, validData);
  }

  async function deleteTemplate(templateId) {
    const exists = await repo.exists(templateId);
    if (!exists) {
      throw new NotFoundError(`Template with ID ${templateId} not found`);
    }
    await repo.remove(templateId);
    return true;
  }

  return {
    createTemplate,
    getTemplate,
    listTemplates,
    updateTemplate,
    deleteTemplate,
  };
}
