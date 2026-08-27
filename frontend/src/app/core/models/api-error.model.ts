/**
 * Тело ошибки, которое возвращает GlobalExceptionHandler бэкенда.
 *
 * Все поля помечены необязательными: если что-то пойдёт совсем не так
 * (например, сервер вообще недоступен), в ответе может не оказаться
 * ничего — и код не должен на этом падать.
 */
export interface ApiError {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  /** Ошибки по конкретным полям формы: { "title": "Заголовок обязателен" } */
  fields?: Record<string, string>;
}
