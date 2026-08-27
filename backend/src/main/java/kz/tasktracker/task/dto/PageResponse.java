package kz.tasktracker.task.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Одна страница результатов.
 * <p>
 * Свой DTO, а не Page от Spring: у Page нет зафиксированного формата JSON,
 * он может измениться с версией библиотеки и утащить за собой фронтенд.
 * Здесь отдаём ровно те поля, которые нужны для постраничной навигации.
 *
 * @param content       записи текущей страницы
 * @param page          номер страницы, счёт с нуля
 * @param size          запрошенный размер страницы
 * @param totalElements сколько всего записей подошло под фильтры
 * @param totalPages    сколько всего получилось страниц
 * @param first         это первая страница
 * @param last          это последняя страница
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
