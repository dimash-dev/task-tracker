package kz.tasktracker.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Единая точка, где исключения превращаются в ответы API.
 * <p>
 * @RestControllerAdvice перехватывает исключения из всех контроллеров, поэтому
 * в самих контроллерах и сервисах не нужно ни try/catch, ни возни с кодами
 * ответа: они просто бросают исключение, а формат ответа задаётся здесь.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** Запрошенной записи нет в базе. */
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException exception,
                                                   HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    /**
     * Не прошли проверки @Valid на теле запроса: пустой заголовок,
     * заголовок длиннее 120 символов, пустое имя тега.
     * Помимо общего сообщения отдаём разбивку по полям.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception,
                                                     HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();

        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        exception.getBindingResult().getGlobalErrors()
                .forEach(error -> fields.putIfAbsent(error.getObjectName(), error.getDefaultMessage()));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiError.ofFields(HttpStatus.BAD_REQUEST,
                        "Проверьте правильность заполнения полей",
                        request.getRequestURI(),
                        fields));
    }

    /**
     * Тело запроса не удалось разобрать: битый JSON или значение, которое
     * не ложится в тип поля — например "status": "ABC".
     * <p>
     * Текст исключения наружу не отдаём: там внутренние детали парсера.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException exception,
                                                         HttpServletRequest request) {
        log.debug("Не удалось прочитать тело запроса {} {}", request.getMethod(), request.getRequestURI(), exception);

        return build(HttpStatus.BAD_REQUEST,
                "Некорректное тело запроса: проверьте синтаксис JSON и значения полей. "
                        + "Допустимые значения status: " + allowedStatuses(),
                request);
    }

    /**
     * Параметр в адресе не подходит по типу: /api/tasks/abc вместо числа
     * или ?status=ABC вместо одного из допустимых статусов.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException exception,
                                                       HttpServletRequest request) {
        Class<?> requiredType = exception.getRequiredType();

        String allowed = requiredType != null && requiredType.isEnum()
                ? ". Допустимые значения: " + Arrays.stream(requiredType.getEnumConstants())
                        .map(String::valueOf)
                        .collect(Collectors.joining(", "))
                : "";

        return build(HttpStatus.BAD_REQUEST,
                "Некорректное значение параметра '" + exception.getName() + "'" + allowed,
                request);
    }

    /** Обращение к несуществующему адресу. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException exception,
                                                     HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "Такого адреса не существует", request);
    }

    /** Адрес существует, но не поддерживает этот HTTP-метод. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception,
                                                             HttpServletRequest request) {
        return build(HttpStatus.METHOD_NOT_ALLOWED,
                "Метод " + exception.getMethod() + " не поддерживается для этого адреса",
                request);
    }

    /**
     * Всё остальное — наша вина, а не клиента.
     * <p>
     * Наружу уходит только общая фраза: ни стектрейса, ни имён классов,
     * ни текста SQL. Подробности пишутся в лог сервера, где их увидит
     * разработчик, а не пользователь и не потенциальный злоумышленник.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception exception,
                                                     HttpServletRequest request) {
        log.error("Необработанная ошибка при {} {}", request.getMethod(), request.getRequestURI(), exception);

        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "Внутренняя ошибка сервера. Попробуйте позже.",
                request);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity
                .status(status)
                .body(ApiError.of(status, message, request.getRequestURI()));
    }

    private String allowedStatuses() {
        return Arrays.stream(kz.tasktracker.task.TaskStatus.values())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
    }
}
