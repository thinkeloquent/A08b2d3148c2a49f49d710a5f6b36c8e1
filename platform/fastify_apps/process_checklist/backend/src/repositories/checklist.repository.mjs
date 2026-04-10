import { validateSchema } from "../zod-schema-contract/common/index.mjs";
import { ListChecklistsQuerySchema } from "../zod-schema-contract/checklists/index.mjs";

export function createChecklistRepository(db) {
  const { ChecklistInstance, ChecklistStep } = db;

  async function findByChecklistId(checklistId) {
    if (typeof checklistId !== "string" || !checklistId) {
      throw new Error("Invalid checklist ID");
    }

    return ChecklistInstance.findOne({
      where: { checklist_id: checklistId },
      include: [{ model: ChecklistStep, as: "steps", required: false }],
      order: [[{ model: ChecklistStep, as: "steps" }, "order", "ASC"]],
    });
  }

  async function findAll(query) {
    const validQuery = validateSchema(
      ListChecklistsQuerySchema,
      query,
      "Invalid query parameters",
    );

    const { page, limit, templateRef, sortBy, sortOrder } = validQuery;
    const offset = (page - 1) * limit;

    const where = {};
    if (templateRef) where.template_ref = templateRef;

    const { count, rows } = await ChecklistInstance.findAndCountAll({
      where,
      include: [{ model: ChecklistStep, as: "steps", required: false }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
      distinct: true,
    });

    return { checklists: rows, total: count };
  }

  async function exists(checklistId) {
    if (typeof checklistId !== "string" || !checklistId) return false;
    const count = await ChecklistInstance.count({
      where: { checklist_id: checklistId },
    });
    return count > 0;
  }

  async function findByTemplateRef(templateRef) {
    if (typeof templateRef !== "string" || !templateRef) {
      throw new Error("Invalid template reference");
    }

    return ChecklistInstance.findAll({
      where: { template_ref: templateRef },
      include: [{ model: ChecklistStep, as: "steps", required: false }],
      order: [
        ["generated_at", "DESC"],
        [{ model: ChecklistStep, as: "steps" }, "order", "ASC"],
      ],
    });
  }

  return { findByChecklistId, findAll, exists, findByTemplateRef };
}
