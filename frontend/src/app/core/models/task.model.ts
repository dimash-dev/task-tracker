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

/**
 * Статусы в виде готовых пунктов для выпадающих списков.
 * Один источник на всё приложение: и форма, и карточка, и фильтр
 * берут список отсюда, а не заводят свою копию.
 */
export const TASK_STATUS_OPTIONS: ReadonlyArray<{ value: TaskStatus; label: string }> = [
  { value: 'TODO', label: TASK_STATUS_LABELS.TODO },
  { value: 'IN_PROGRESS', label: TASK_STATUS_LABELS.IN_PROGRESS },
  { value: 'DONE', label: TASK_STATUS_LABELS.DONE },
];
