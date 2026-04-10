import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import { GenerateChecklistSchema } from "../zod-schema-contract/checklists/index.mjs";
import { NotFoundError } from "../plugins/error-handler.mjs";
import { createTemplateRepository } from "../repositories/template.repository.mjs";

export function createChecklistGenerationService(db) {
  const { sequelize, ChecklistInstance, ChecklistStep } = db;
  const templateRepo = createTemplateRepository(db);

  function generateChecklistId(templateId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${templateId}-${timestamp}-${random}`;
  }

  function applyParameterization(text, parameters) {
    let result = text;
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, String(value));
    }
    return result;
  }

  async function generateFromTemplate(data) {
    const validData = validateSchema(
      GenerateChecklistSchema,
      data,
      "Invalid checklist generation data",
    );

    const transaction = await sequelize.transaction();

    try {
      const template = await templateRepo.findByTemplateId(
        validData.templateId,
      );

      if (!template) {
        throw new NotFoundError(
          `Template with ID ${validData.templateId} not found`,
        );
      }

      if (!template.steps || template.steps.length === 0) {
        throw new Error(`Template ${validData.templateId} has no steps`);
      }

      const checklistId = generateChecklistId(validData.templateId);

      await ChecklistInstance.create(
        {
          checklist_id: checklistId,
          template_ref: validData.templateId,
          generated_at: new Date(),
          metadata: {
            templateVersion: template.version,
            parameters: validData.parameters || {},
            generatedFrom: validData.templateId,
          },
        },
        { transaction },
      );

      const params = validData.parameters || {};

      await Promise.all(
        template.steps.map((templateStep) => {
          const title = applyParameterization(templateStep.title, params);
          const description = templateStep.description
            ? applyParameterization(templateStep.description, params)
            : null;

          return ChecklistStep.create(
            {
              checklist_id: checklistId,
              order: templateStep.order,
              title,
              description,
              required: templateStep.required,
              tags: [...templateStep.tags],
              dependencies: [...templateStep.dependencies],
            },
            { transaction },
          );
        }),
      );

      await transaction.commit();

      // Load complete instance with steps
      const result = await ChecklistInstance.findOne({
        where: { checklist_id: checklistId },
        include: [{ model: ChecklistStep, as: "steps", required: false }],
        order: [[{ model: ChecklistStep, as: "steps" }, "order", "ASC"]],
      });

      if (!result) {
        throw new Error("Failed to load generated checklist");
      }

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return { generateFromTemplate };
}
