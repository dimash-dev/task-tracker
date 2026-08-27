package kz.tasktracker.task;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Сборка условий выборки для GET /api/tasks.
 * <p>
 * Specification — это кусочек условия WHERE, который Spring Data превращает
 * в SQL. Так фильтры можно свободно комбинировать: пустые параметры просто
 * не попадают в запрос, а не превращаются в «поле = null».
 */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /**
     * Все три фильтра соединяются через AND. Любой из них может быть пустым:
     * тогда он в условие не добавляется. Если пусты все — вернётся условие
     * без ограничений, то есть полный список.
     */
    public static Specification<Task> matching(TaskStatus status, String tag, String search) {
        return (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();

            if (status != null) {
                conditions.add(cb.equal(root.get("status"), status));
            }

            if (hasText(tag)) {
                // INNER JOIN к task_tags и tags: задача попадёт в выборку,
                // только если у неё есть тег с таким именем.
                Join<Task, Tag> tags = root.join("tags", JoinType.INNER);
                conditions.add(cb.equal(cb.lower(tags.get("name")), tag.trim().toLowerCase()));
            }

            if (hasText(search)) {
                conditions.add(cb.like(cb.lower(root.get("title")), likePattern(search), '\\'));
            }

            return cb.and(conditions.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    /**
     * Шаблон для LIKE. Спецсимволы в пользовательском вводе экранируются,
     * иначе поиск по «100%» вёл бы себя как маска, а не как текст.
     */
    private static String likePattern(String search) {
        String escaped = search.trim().toLowerCase()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
