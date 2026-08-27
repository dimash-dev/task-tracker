package kz.tasktracker.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kz.tasktracker.task.TaskStatus;

import java.util.Set;

/**
 * Данные для полного обновления задачи. Тело PUT /api/tasks/{id}.
 * <p>
 * PUT заменяет задачу целиком, поэтому статус здесь обязателен: пропущенное
 * поле означало бы «сбросить значение», а не «оставить как было».
 *
 * @param title       заголовок, обязателен, не длиннее 120 символов
 * @param description описание, необязательно
 * @param status      статус, обязателен
 * @param tags        полный новый набор тегов; пустой набор снимет все теги
 */
public record TaskUpdateRequest(

        @NotBlank(message = "Заголовок обязателен")
        @Size(max = 120, message = "Заголовок не может быть длиннее 120 символов")
        String title,

        String description,

        @NotNull(message = "Статус обязателен")
        TaskStatus status,

        Set<
                @NotBlank(message = "Имя тега не может быть пустым")
                @Size(max = 50, message = "Имя тега не может быть длиннее 50 символов")
                String
        > tags
) {
}
