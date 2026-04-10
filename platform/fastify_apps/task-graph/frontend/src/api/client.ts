import type {
  Task,
  CreateTaskInput,
  Step,
  BatchCreateStepsInput,
  StepProgress,
  Checkpoint,
  CreateCheckpointInput,
  Dependency,
  CreateDependencyInput,
  DependencyGraph,
  ExecutionReadiness,
  ExecutionLog,
  ExecutionTimeline,
  FailedJob,
  TaskFile,
  CreateFileInput,
  Note,
  CreateNoteInput,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/~/api/task-graph';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        }));
        throw new Error(errorData.error?.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Task endpoints
  async getTasks(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Task>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.request(`/tasks?${query.toString()}`);
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`);
  }

  async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTask(id: string, input: Partial<CreateTaskInput>): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async startTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/start`, {
      method: 'POST',
    });
  }

  async completeTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/complete`, {
      method: 'POST',
    });
  }

  async failTask(id: string, error?: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ error }),
    });
  }

  async skipTask(id: string, reason: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/skip`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async retryTask(id: string): Promise<ApiResponse<Task>> {
    return this.request(`/tasks/${id}/retry`, {
      method: 'POST',
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Step endpoints
  async getStepsByTask(taskId: string): Promise<ApiResponse<{ steps: Step[] }>> {
    return this.request(`/steps/task/${taskId}`);
  }

  async batchCreateSteps(input: BatchCreateStepsInput): Promise<ApiResponse<{ steps: Step[] }>> {
    return this.request('/steps/batch', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async startStep(stepId: string): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}/start`, {
      method: 'POST',
    });
  }

  async completeStep(stepId: string): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}/complete`, {
      method: 'POST',
    });
  }

  async skipStep(stepId: string, reason: string, metadata?: Record<string, unknown>): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}/skip`, {
      method: 'POST',
      body: JSON.stringify({ reason, metadata }),
    });
  }

  async blockStep(stepId: string, reason: string, metadata?: Record<string, unknown>): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason, metadata }),
    });
  }

  async updateStep(stepId: string, updates: {
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async unblockStep(stepId: string): Promise<ApiResponse<Step>> {
    return this.request(`/steps/${stepId}/unblock`, {
      method: 'POST',
    });
  }

  async getStepProgress(taskId: string): Promise<ApiResponse<StepProgress>> {
    return this.request(`/steps/task/${taskId}/progress`);
  }

  // Checkpoint endpoints
  async createCheckpoint(input: CreateCheckpointInput): Promise<ApiResponse<Checkpoint>> {
    return this.request('/checkpoints', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getCheckpoint(taskId: string, checkpointId: string): Promise<ApiResponse<Checkpoint>> {
    return this.request(`/checkpoints/${taskId}/${checkpointId}`);
  }

  async listCheckpoints(taskId: string): Promise<ApiResponse<{ checkpoints: Checkpoint[] }>> {
    return this.request(`/checkpoints/${taskId}`);
  }

  async restoreCheckpoint(taskId: string, checkpointId: string): Promise<ApiResponse<Checkpoint>> {
    return this.request(`/checkpoints/${taskId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ checkpointId }),
    });
  }

  // Dependency endpoints
  async createDependency(input: CreateDependencyInput): Promise<ApiResponse<Dependency>> {
    return this.request('/dependencies', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getDependencyGraph(taskId: string): Promise<ApiResponse<DependencyGraph>> {
    return this.request(`/dependencies/${taskId}/graph`);
  }

  async getExecutionReadiness(taskId: string): Promise<ApiResponse<ExecutionReadiness>> {
    return this.request(`/dependencies/${taskId}/execution-readiness`);
  }

  async removeDependency(prerequisiteId: string, dependentId: string): Promise<ApiResponse<void>> {
    return this.request(`/dependencies/${prerequisiteId}/${dependentId}`, {
      method: 'DELETE',
    });
  }

  // Execution log endpoints
  async getExecutionLogs(params: {
    taskId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<ExecutionLog>> {
    const query = new URLSearchParams();
    if (params.taskId) query.append('taskId', params.taskId);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    return this.request(`/executions/logs?${query.toString()}`);
  }

  async getExecutionTimeline(taskId: string): Promise<ApiResponse<ExecutionTimeline>> {
    return this.request(`/executions/timeline/${taskId}`);
  }

  // Failed Jobs endpoints
  async getFailedJobs(params?: {
    jobType?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<FailedJob>> {
    const query = new URLSearchParams();
    if (params?.jobType) query.append('jobType', params.jobType);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.request(`/failed-jobs?${query.toString()}`);
  }

  async getFailedJob(id: string): Promise<ApiResponse<FailedJob>> {
    return this.request(`/failed-jobs/${id}`);
  }

  async retryFailedJob(id: string): Promise<ApiResponse<FailedJob>> {
    return this.request(`/failed-jobs/${id}/retry`, {
      method: 'POST',
    });
  }

  async deleteFailedJob(id: string): Promise<ApiResponse<void>> {
    return this.request(`/failed-jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> {
    return this.request('/health');
  }

  // File endpoints
  async getFilesByTask(taskId: string): Promise<ApiResponse<TaskFile[]>> {
    return this.request(`/files/task/${taskId}`);
  }

  async getFilesByStep(stepId: string): Promise<ApiResponse<TaskFile[]>> {
    return this.request(`/files/step/${stepId}`);
  }

  async createFile(input: CreateFileInput): Promise<ApiResponse<TaskFile>> {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateFile(fileId: string, stepId: string | null): Promise<ApiResponse<TaskFile>> {
    return this.request(`/files/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stepId }),
    });
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Note endpoints
  async getNotesByTask(taskId: string): Promise<ApiResponse<Note[]>> {
    return this.request(`/notes/task/${taskId}`);
  }

  async createNote(input: CreateNoteInput): Promise<ApiResponse<Note>> {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateNote(noteId: string, content: string): Promise<ApiResponse<Note>> {
    return this.request(`/notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteNote(noteId: string): Promise<ApiResponse<void>> {
    return this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
