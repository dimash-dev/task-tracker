package kz.tasktracker.exception;

/**
 * Запрошенной записи нет в базе.
 * <p>
 * Код ответа здесь больше не задаётся: превращением этого исключения
 * в ответ 404 с единым телом занимается GlobalExceptionHandler.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
