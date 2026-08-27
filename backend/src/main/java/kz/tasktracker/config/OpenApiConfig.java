package kz.tasktracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Заголовок документации API.
 * <p>
 * Сами эндпоинты, параметры и схемы springdoc собирает из кода: аннотаций
 * контроллера, типов DTO и ограничений Bean Validation. Здесь задаётся
 * только то, что из кода не выводится — название, описание и версия.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskTrackerOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Task Tracker API")
                .description("""
                        REST API для управления задачами: создание, изменение, удаление, \
                        фильтрация по статусу и тегам, поиск по заголовку, пагинация \
                        и сортировка по дате создания.

                        Ошибки возвращаются в едином формате ApiError.""")
                .version("1.0.0"));
    }
}
