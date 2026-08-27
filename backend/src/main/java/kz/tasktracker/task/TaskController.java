package kz.tasktracker.task;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.tasktracker.exception.ApiError;
import kz.tasktracker.task.dto.PageResponse;
import kz.tasktracker.task.dto.TaskCreateRequest;
import kz.tasktracker.task.dto.TaskResponse;
import kz.tasktracker.task.dto.TaskStatusUpdateRequest;
import kz.tasktracker.task.dto.TaskUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * HTTP-интерфейс к задачам. Здесь только приём запроса и отдача ответа —
 * никакой логики и никаких обращений к базе.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Задачи", description = "Создание, изменение, удаление и выборка задач")
public class TaskController {

    private final TaskService taskService;

    /**
     * Список задач. Все параметры необязательны и комбинируются между собой:
     * ?status=TODO&tag=backend&search=фильтр&page=0&size=20&direction=desc
     */
    @Operation(summary = "Список задач",
            description = "Фильтры по статусу и тегу, поиск по заголовку, пагинация "
                    + "и сортировка по дате создания. Все параметры необязательны "
                    + "и складываются между собой.")
    @ApiResponse(responseCode = "200", description = "Страница задач")
    @ApiResponse(responseCode = "400", description = "Недопустимое значение параметра",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping
    public PageResponse<TaskResponse> search(
            @Parameter(description = "Фильтр по статусу", example = "TODO")
            @RequestParam(required = false) TaskStatus status,

            @Parameter(description = "Фильтр по имени тега, регистр не важен", example = "backend")
            @RequestParam(required = false) String tag,

            @Parameter(description = "Поиск подстроки в заголовке, регистр не важен", example = "фильтр")
            @RequestParam(required = false) String search,

            @Parameter(description = "Номер страницы, счёт с нуля")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Размер страницы, максимум 100")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Направление сортировки по дате создания: desc или asc")
            @RequestParam(defaultValue = "desc") String direction) {

        return taskService.search(status, tag, search, page, size, direction);
    }

    @Operation(summary = "Задача по идентификатору")
    @ApiResponse(responseCode = "200", description = "Задача найдена")
    @ApiResponse(responseCode = "404", description = "Задачи с таким id нет",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{id}")
    public TaskResponse findById(@Parameter(description = "Идентификатор задачи", example = "1")
                                 @PathVariable Long id) {
        return taskService.findById(id);
    }

    /**
     * @Valid запускает проверку ограничений из TaskCreateRequest.
     * Если данные не прошли — клиент получает 400, а метод не вызывается.
     */
    @Operation(summary = "Создать задачу",
            description = "Обязателен только заголовок. Без статуса задача создаётся как TODO. "
                    + "Несуществующие теги создаются автоматически.")
    @ApiResponse(responseCode = "201", description = "Задача создана")
    @ApiResponse(responseCode = "400", description = "Ошибка валидации или некорректный JSON",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request) {
        return taskService.create(request);
    }

    @Operation(summary = "Обновить задачу целиком",
            description = "Заменяет все поля присланными значениями, включая набор тегов.")
    @ApiResponse(responseCode = "200", description = "Задача обновлена")
    @ApiResponse(responseCode = "400", description = "Ошибка валидации или некорректный JSON",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Задачи с таким id нет",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PutMapping("/{id}")
    public TaskResponse update(@Parameter(description = "Идентификатор задачи", example = "1")
                               @PathVariable Long id,
                               @Valid @RequestBody TaskUpdateRequest request) {
        return taskService.update(id, request);
    }

    /**
     * Быстрая смена статуса — для кнопок прямо в карточке задачи,
     * чтобы не гонять целиком всю задачу ради одного поля.
     */
    @Operation(summary = "Сменить статус задачи",
            description = "Меняет только статус, остальные поля не трогает.")
    @ApiResponse(responseCode = "200", description = "Статус изменён")
    @ApiResponse(responseCode = "400", description = "Статус не указан или недопустим",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Задачи с таким id нет",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PatchMapping("/{id}/status")
    public TaskResponse updateStatus(@Parameter(description = "Идентификатор задачи", example = "1")
                                     @PathVariable Long id,
                                     @Valid @RequestBody TaskStatusUpdateRequest request) {
        return taskService.updateStatus(id, request);
    }

    @Operation(summary = "Удалить задачу",
            description = "Связи с тегами удаляются вместе с задачей, сами теги остаются.")
    @ApiResponse(responseCode = "204", description = "Задача удалена")
    @ApiResponse(responseCode = "404", description = "Задачи с таким id нет",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@Parameter(description = "Идентификатор задачи", example = "1")
                       @PathVariable Long id) {
        taskService.delete(id);
    }
}
