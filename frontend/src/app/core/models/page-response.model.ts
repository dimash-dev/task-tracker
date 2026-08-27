/**
 * Одна страница результатов — соответствует PageResponse<T> на бэкенде.
 *
 * <T> означает, что тип содержимого подставляется при использовании:
 * PageResponse<Task> — страница задач.
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
