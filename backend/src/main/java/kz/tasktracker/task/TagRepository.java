package kz.tasktracker.task;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Доступ к таблице tags.
 */
public interface TagRepository extends JpaRepository<Tag, Long> {
}
