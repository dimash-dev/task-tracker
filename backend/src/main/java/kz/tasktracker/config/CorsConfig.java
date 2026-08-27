package kz.tasktracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Разрешение запросов от фронтенда.
 * <p>
 * Браузер по умолчанию не даёт странице с одного адреса обращаться к другому.
 * Angular в разработке живёт на localhost:4200, бэкенд — на localhost:8080,
 * для браузера это разные источники, и без явного разрешения он заблокирует
 * запросы.
 * <p>
 * Настройка одна на всё приложение: аннотации @CrossOrigin по контроллерам
 * не используются, иначе правила расползаются по коду и рассинхронизируются.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final String FRONTEND_ORIGIN = "http://localhost:4200";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(FRONTEND_ORIGIN)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "Accept", "Origin")
                .maxAge(3600);
    }
}
