package kz.tasktracker.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Доступ к таблице tags.
 */
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * Найти тег по точному имени.
     * <p>
     * Тело метода писать не нужно: Spring Data разбирает имя findByName
     * и сам строит запрос к колонке name.
     */
    Optional<Tag> findByName(String name);
}
