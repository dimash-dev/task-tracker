package kz.tasktracker.task;

import kz.tasktracker.exception.NotFoundException;
import kz.tasktracker.task.dto.TaskCreateRequest;
import kz.tasktracker.task.dto.TaskResponse;
import kz.tasktracker.task.dto.TaskUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Вся работа с задачами. Контроллер только принимает HTTP-запрос и передаёт
 * данные сюда, а обращение к базе идёт через репозитории.
 * <p>
 * readOnly = true на уровне класса — режим по умолчанию для чтения;
 * методы, которые пишут в базу, помечены обычным @Transactional отдельно.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final TagRepository tagRepository;

    public List<TaskResponse> findAll() {
        return taskRepository.findAll().stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(Long id) {
        return TaskResponse.from(getTaskOrThrow(id));
    }

    @Transactional
    public TaskResponse create(TaskCreateRequest request) {
        Task task = new Task();
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status() != null ? request.status() : TaskStatus.TODO);
        task.setTags(resolveTags(request.tags()));

        return TaskResponse.from(taskRepository.save(task));
    }

    /**
     * PUT заменяет задачу целиком: все поля перезаписываются присланными
     * значениями, включая набор тегов.
     */
    @Transactional
    public TaskResponse update(Long id, TaskUpdateRequest request) {
        Task task = getTaskOrThrow(id);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setTags(resolveTags(request.tags()));

        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(getTaskOrThrow(id));
    }

    private Task getTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Задача с id " + id + " не найдена"));
    }

    /**
     * Превращает имена тегов в записи таблицы tags.
     * <p>
     * Существующий тег переиспользуется, новый создаётся. Имена приводятся
     * к нижнему регистру и обрезаются по краям, иначе «Bug», «bug » и «bug»
     * стали бы тремя разными тегами.
     */
    private Set<Tag> resolveTags(Set<String> names) {
        Set<Tag> tags = new LinkedHashSet<>();
        if (names == null) {
            return tags;
        }

        for (String rawName : names) {
            String name = rawName.trim().toLowerCase();
            Tag tag = tagRepository.findByName(name)
                    .orElseGet(() -> tagRepository.save(new Tag(name)));
            tags.add(tag);
        }
        return tags;
    }
}
