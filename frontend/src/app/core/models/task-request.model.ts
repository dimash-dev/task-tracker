import { TaskStatus } from './task.model';

/**
 * Тело POST /api/tasks — соответствует TaskCreateRequest на бэкенде.
 *
 * Обязателен только заголовок: без статуса задача создаётся как TODO,
 * без тегов — вообще без тегов.
 */
export interface TaskCreateRequest {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  tags?: string[];
}

/**
 * Тело PUT /api/tasks/{id} — соответствует TaskUpdateRequest на бэкенде.
 *
 * Отличие от создания одно: статус обязателен. PUT заменяет задачу
 * целиком, и пропущенное поле означало бы «сбросить», а не «оставить».
 */
export interface TaskUpdateRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  tags?: string[];
}
