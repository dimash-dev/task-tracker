package kz.tasktracker.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import kz.tasktracker.task.TaskStatus;

import java.util.Set;

/**
 * Данные для создания задачи. Приходят от клиента в теле POST /api/tasks.
 * <p>
 * Ограничения проверяются до того, как запрос дойдёт до сервиса: если что-то
 * не так, клиент получает 400, а до базы дело не доходит.
 *
 * @param title       заголовок, обязателен, не длиннее 120 символов
 * @param description описание, необязательно
 * @param status      статус, необязателен: без него задача создаётся как TODO
 * @param tags        имена тегов, необязательны; несуществующие будут созданы
 */
public record TaskCreateRequest(

        @NotBlank(message = "Заголовок обязателен")
        @Size(max = 120, message = "Заголовок не может быть длиннее 120 символов")
        String title,

        String description,

        TaskStatus status,

        Set<
                @NotBlank(message = "Имя тега не может быть пустым")
                @Size(max = 50, message = "Имя тега не может быть длиннее 50 символов")
                String
        > tags
) {
}
