package kz.tasktracker.task;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Доступ к таблице tasks.
 * <p>
 * Тело пустое намеренно: JpaRepository уже даёт save, findById, findAll,
 * deleteById и постраничную выборку. Свои методы появятся на этапах CRUD
 * и фильтрации, когда станет понятно, какие именно нужны.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {
}
