package kz.tasktracker.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Доступ к таблице tasks.
 * <p>
 * JpaRepository даёт save, findById, findAll, deleteById.
 * JpaSpecificationExecutor добавляет findAll(Specification, Pageable) —
 * выборку с произвольными условиями, сортировкой и постранично.
 */
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
}
