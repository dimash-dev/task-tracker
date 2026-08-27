import { TaskStatus } from './task.model';

/**
 * Набор условий выборки для GET /api/tasks.
 *
 * Все поля необязательны: то, что не заполнено, в запрос не попадёт,
 * и бэкенд применит свои значения по умолчанию.
 */
export interface TaskQuery {
  status?: TaskStatus | null;
  tag?: string | null;
  search?: string | null;
  page?: number;
  size?: number;
  direction?: 'asc' | 'desc';
}
