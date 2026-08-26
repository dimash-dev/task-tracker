package kz.tasktracker.task;

/**
 * Статус задачи.
 * <p>
 * Набор значений повторяет ограничение chk_tasks_status из миграции V1__init.sql.
 * Если понадобится новый статус — сначала миграция, потом константа здесь.
 */
public enum TaskStatus {

    TODO,
    IN_PROGRESS,
    DONE
}
