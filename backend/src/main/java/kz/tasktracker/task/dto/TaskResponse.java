package kz.tasktracker.task.dto;

import kz.tasktracker.task.Tag;
import kz.tasktracker.task.Task;
import kz.tasktracker.task.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Ответ API с данными задачи. Уходит клиенту из всех эндпоинтов, кроме DELETE.
 * <p>
 * Теги отдаются простым списком имён: клиенту незачем знать про их
 * идентификаторы и про таблицу-связку. Список отсортирован, чтобы порядок
 * не менялся от запроса к запросу.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        List<String> tags,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static TaskResponse from(Task task) {
        List<String> tagNames = task.getTags().stream()
                .map(Tag::getName)
                .sorted()
                .toList();

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                tagNames,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
