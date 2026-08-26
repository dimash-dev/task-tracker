package kz.tasktracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Включает аудит Spring Data JPA.
 * <p>
 * Без этой аннотации поля @CreatedDate и @LastModifiedDate остаются пустыми:
 * сам по себе AuditingEntityListener на сущности ничего не делает.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
