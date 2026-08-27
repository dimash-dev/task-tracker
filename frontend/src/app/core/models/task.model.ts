/**
 * Статус задачи. Значения совпадают с enum TaskStatus на бэкенде
 * и с ограничением chk_tasks_status в базе.
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

/**
 * Задача в том виде, в каком её отдаёт бэкенд (TaskResponse).
 *
 * createdAt и updatedAt — строки, а не Date: по сети даты приходят
 * текстом в формате ISO ("2026-08-01T09:15:00"), и превращать их
 * в объект Date имеет смысл только там, где это реально нужно.
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** Подписи статусов для интерфейса. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  DONE: 'Готово',
};
