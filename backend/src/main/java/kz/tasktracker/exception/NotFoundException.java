package kz.tasktracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Запрошенной записи нет в базе.
 * <p>
 * @ResponseStatus здесь — временное решение: оно даёт клиенту код 404 без
 * отдельного обработчика. На этапе с глобальной обработкой исключений
 * аннотация уедет, а ответ получит понятную структуру с текстом ошибки.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
