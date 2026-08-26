package kz.tasktracker.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Objects;

/**
 * Тег. Отдельная запись в таблице tags, одно имя — одна строка.
 */
@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String name;

    public Tag(String name) {
        this.name = name;
    }

    /**
     * Сравнение по имени, а не по id.
     * <p>
     * Имя уникально в базе (ограничение uq_tags_name), поэтому оно однозначно
     * определяет тег. Плюс так корректно работает Set<Tag> у задачи ещё до того,
     * как новый тег сохранён и получил id.
     */
    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Tag tag)) {
            return false;
        }
        return name != null && name.equals(tag.name);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(name);
    }

    @Override
    public String toString() {
        return "Tag{id=" + id + ", name='" + name + "'}";
    }
}
