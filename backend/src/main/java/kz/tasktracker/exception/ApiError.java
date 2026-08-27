package kz.tasktracker.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Единый формат тела ошибки для всего API.
 * <p>
 * Один и тот же набор полей на любую ошибку — фронтенду не приходится
 * разбирать несколько разных форматов.
 *
 * @param status    HTTP-код: 400, 404, 500
 * @param error     стандартное название кода: Bad Request, Not Found
 * @param message   человекочитаемое описание, безопасное для показа клиенту
 * @param path      адрес запроса, на котором случилась ошибка
 * @param timestamp момент возникновения
 * @param fields    ошибки по конкретным полям формы; пустая карта, если их нет
 */
public record ApiError(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp,
        Map<String, String> fields
) {

    public static ApiError of(HttpStatus status, String message, String path) {
        return new ApiError(status.value(), status.getReasonPhrase(), message, path, LocalDateTime.now(), Map.of());
    }

    public static ApiError ofFields(HttpStatus status, String message, String path, Map<String, String> fields) {
        return new ApiError(status.value(), status.getReasonPhrase(), message, path, LocalDateTime.now(), fields);
    }
}
