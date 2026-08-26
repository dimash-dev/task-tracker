# Task Tracker

Веб-приложение для управления задачами и заметками: категоризация по тегам, статусы выполнения,
фильтрация, поиск и пагинация.

---

## Стек технологий

| Слой | Технологии |
| :--- | :--- |
| Backend | Java 21, Spring Boot 4.0.8 (Web, Data JPA, Validation), Maven |
| База данных | PostgreSQL 16, миграции через Flyway |
| Frontend | Angular 20, TypeScript, RxJS, Angular Material |
| Документация API | springdoc-openapi (Swagger UI) |
| Инфраструктура | Docker Compose |

---

## Системные требования

| Инструмент | Версия | Комментарий |
| :--- | :--- | :--- |
| JDK | 21+ | Temurin / Oracle / Corretto |
| Maven | 3.9+ | либо `./mvnw` из репозитория |
| Node.js | 20+ | вместе с npm 10+ |
| PostgreSQL | 16 | не нужен, если поднимаете БД через Docker |
| Docker Desktop | 4.x | опционально, для запуска БД одной командой |

---

## Быстрый старт

### 1. База данных

Через Docker (рекомендуемый способ):

```bash
docker compose up -d db
```

Поднимется PostgreSQL 16 со следующими параметрами:

| Параметр | Значение |
| :--- | :--- |
| Host / Port | `localhost:5432` |
| Database | `task_tracker` |
| User | `task_tracker` |
| Password | `task_tracker` |

Проверить, что база готова:

```bash
docker compose ps
```

Остановить (данные сохраняются в volume `postgres-data`):

```bash
docker compose down
```

Полностью удалить вместе с данными:

```bash
docker compose down -v
```

Без Docker — создайте базу и пользователя вручную в локальном PostgreSQL:

```sql
CREATE DATABASE task_tracker;
CREATE USER task_tracker WITH PASSWORD 'task_tracker';
GRANT ALL PRIVILEGES ON DATABASE task_tracker TO task_tracker;
```

### 2. Backend

Требуется запущенная база из шага 1.

```bash
cd backend
mvn spring-boot:run
```

Приложение поднимается на `http://localhost:8080`.
Схема БД накатывается автоматически миграциями Flyway при старте.

Сборка исполняемого jar:

```bash
cd backend
mvn clean package
java -jar target/task-tracker-0.0.1-SNAPSHOT.jar
```

Параметры подключения читаются из `backend/src/main/resources/application.yml`
и переопределяются переменными окружения:

| Переменная | Значение по умолчанию |
| :--- | :--- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/task_tracker` |
| `DB_USERNAME` | `task_tracker` |
| `DB_PASSWORD` | `task_tracker` |
| `SERVER_PORT` | `8080` |

Чтобы проект собирался без предустановленного Maven, один раз сгенерируйте wrapper:

```bash
cd backend
mvn wrapper:wrapper
```

После этого вместо `mvn` можно использовать `./mvnw` (Linux/macOS) или `mvnw.cmd` (Windows).

### 3. Frontend

<!-- TODO: этап 10 — заполнить после создания Angular проекта -->

```bash
cd frontend
npm install
npm start
```

Интерфейс доступен на `http://localhost:4200` и обращается к backend через proxy.

---

## API

<!-- TODO: этап 5-6 — дополнить примерами запросов, этап 8 — ссылка на Swagger UI -->

| Метод | URL | Описание |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Список задач: фильтры `status`, `tag`, поиск `search`, пагинация и сортировка |
| `GET` | `/api/tasks/{id}` | Задача по идентификатору |
| `POST` | `/api/tasks` | Создание задачи |
| `PUT` | `/api/tasks/{id}` | Полное обновление задачи |
| `PATCH` | `/api/tasks/{id}/status` | Быстрая смена статуса |
| `DELETE` | `/api/tasks/{id}` | Удаление задачи |
| `GET` | `/api/tags` | Список всех тегов для фильтра |

Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Структура репозитория

```text
task-tracker/
├── backend/             # Spring Boot приложение (Java 21, Maven)
├── frontend/            # Angular приложение (TypeScript)
├── docker-compose.yml   # PostgreSQL для локальной разработки
├── .gitattributes       # нормализация переводов строк
├── .gitignore
└── README.md
```

---

## Разработка

Работа ведётся через ветки, прямые коммиты в `main` не используются.
Каждый этап — отдельная ветка и отдельный Pull Request в `main`.

| Ветка | Содержание |
| :--- | :--- |
| `chore/init` | Инициализация репозитория, `.gitignore`, `docker-compose.yml`, README |
| `feature/backend-skeleton` | Скелет Spring Boot, подключение к БД |
| `feature/backend-db-migrations` | Flyway-миграции: `tasks`, `tags`, `task_tags` |
| `feature/backend-domain` | Entity, enum статусов, репозитории, JPA-аудит |
| `feature/backend-crud` | DTO, валидация, сервис и контроллер CRUD |
| `feature/backend-filtering` | Фильтрация, поиск, пагинация, эндпоинт тегов |
| `feature/backend-error-handling` | Глобальный обработчик исключений, CORS |
| `feature/backend-swagger` | Документация API через springdoc-openapi |
| `feature/frontend-skeleton` | Скелет Angular, API-сервисы, модели |
| `feature/frontend-task-list` | Dashboard со списком задач |
| `feature/frontend-filters` | Панель фильтров и поиска |
| `feature/frontend-task-form` | Форма создания и редактирования |
| `feature/frontend-ux` | Смена статуса, удаление, загрузка и ошибки |
| `feature/integration` | Dockerfile'ы, полный docker-compose, сквозная проверка |
| `docs/readme` | Финальная документация |

Сообщения коммитов — в стиле Conventional Commits на английском языке:
`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
