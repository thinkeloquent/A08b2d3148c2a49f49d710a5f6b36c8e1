import { NotFoundError } from "../plugins/error-handler.mjs";
import { createChecklistRepository } from "../repositories/checklist.repository.mjs";
import { createChecklistGenerationService } from "./checklist-generation.service.mjs";

export function createChecklistService(db) {
  const repo = createChecklistRepository(db);
  const generation = createChecklistGenerationService(db);

  async function generateChecklist(data) {
    return generation.generateFromTemplate(data);
  }

  async function getChecklist(checklistId) {
    const checklist = await repo.findByChecklistId(checklistId);
    if (!checklist) {
      throw new NotFoundError(`Checklist with ID ${checklistId} not found`);
    }
    return checklist;
  }

  async function listChecklists(query) {
    const { checklists, total } = await repo.findAll(query);
    const page = query.page || 1;
    const limit = query.limit || 20;

    return {
      checklists,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  return { generateChecklist, getChecklist, listChecklists };
}
