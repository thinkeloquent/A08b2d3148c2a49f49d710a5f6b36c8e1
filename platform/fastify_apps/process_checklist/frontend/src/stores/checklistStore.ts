import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  ChecklistInstance,
  GenerateChecklistRequest,
  ListChecklistsQuery,
} from '../types/api.types';
import { checklistService } from '../services/checklists.service';
import { getErrorMessage } from '../services/api.client';

interface ChecklistState {
  checklists: ChecklistInstance[];
  selectedChecklist: ChecklistInstance | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  total: number;

  generateChecklist: (data: GenerateChecklistRequest) => Promise<ChecklistInstance | null>;
  fetchChecklists: (query?: ListChecklistsQuery) => Promise<void>;
  fetchChecklist: (checklistId: string) => Promise<void>;
  setSelectedChecklist: (checklist: ChecklistInstance | null) => void;
  clearError: () => void;
}

export const useChecklistStore = create<ChecklistState>()(
  devtools(
    (set) => ({
      checklists: [],
      selectedChecklist: null,
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      total: 0,

      generateChecklist: async (data: GenerateChecklistRequest) => {
        set({ loading: true, error: null });
        try {
          const checklist = await checklistService.generateChecklist(data);
          set({
            selectedChecklist: checklist,
            loading: false,
          });
          return checklist;
        } catch (error) {
          set({
            error: getErrorMessage(error),
            loading: false,
          });
          return null;
        }
      },

      fetchChecklists: async (query?: ListChecklistsQuery) => {
        set({ loading: true, error: null });
        try {
          const result = await checklistService.listChecklists(query);
          set({
            checklists: result.checklists,
            currentPage: result.meta.page,
            totalPages: result.meta.totalPages,
            total: result.meta.total,
            loading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            loading: false,
          });
        }
      },

      fetchChecklist: async (checklistId: string) => {
        set({ loading: true, error: null });
        try {
          const checklist = await checklistService.getChecklist(checklistId);
          set({
            selectedChecklist: checklist,
            loading: false,
          });
        } catch (error) {
          set({
            error: getErrorMessage(error),
            loading: false,
          });
        }
      },

      setSelectedChecklist: (checklist: ChecklistInstance | null) => {
        set({ selectedChecklist: checklist });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'ChecklistStore' }
  )
);
