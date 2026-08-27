package kz.tasktracker.task.dto;

import jakarta.validation.constraints.NotNull;
import kz.tasktracker.task.TaskStatus;

/**
 * Тело PATCH /api/tasks/{id}/status — быстрая смена статуса.
 * <p>
 * Отдельный DTO, а не переиспользование TaskUpdateRequest: у того обязателен
 * заголовок, и клиенту пришлось бы присылать всю задачу целиком ради одного
 * поля. Здесь ровно одно поле, и оно обязательное.
 *
 * @param status новый статус, обязателен
 */
public record TaskStatusUpdateRequest(

        @NotNull(message = "Статус обязателен")
        TaskStatus status
) {
}
