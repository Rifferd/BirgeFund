# BirgeFund

BirgeFund — демонстрационная краудфандинговая платформа для Кыргызстана.

Проект сделан как backend/fullstack-портфолио: пользователи, роли и права, проекты, модерация, тестовые платежи, ledger, refund, жалобы, комментарии, CMS, баннеры, переводы и admin API.

## Статус проекта

Проект работает в **TEST MODE**.

Это значит:

- реальные платежи не принимаются;
- реальные деньги не списываются;
- mock payments используются только для демонстрации;
- финансовая история хранится через immutable ledger.

## Стек

Backend:

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis
- JWT auth
- Docker / Docker Compose
- Pytest

Frontend:

- React / Vite
- TypeScript
- TailwindCSS

## Быстрый запуск

```bash
cp .env.example .env

docker compose up -d postgres redis
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend python -m app.db.seed_demo
docker compose up --build
```

После запуска:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/health`

## Demo-данные

Seed создаёт пользователей, роли, permissions, категории, CMS-страницу, баннер, переводы, demo-проекты и тестовую оплату.

Подробнее: [docs/DEMO.md](docs/DEMO.md)

Основные demo-аккаунты:

| Роль | Email | Пароль |
|---|---|---|
| Super Admin | `admin@birgefund.kg` | `AdminPass123!` |
| Moderator | `moderator@birgefund.kg` | `ModeratorPass123!` |
| Finance Manager | `finance@birgefund.kg` | `FinancePass123!` |
| Content Manager | `content@birgefund.kg` | `ContentPass123!` |
| Author | `author@birgefund.kg` | `AuthorPass123!` |
| Backer | `backer@birgefund.kg` | `BackerPass123!` |

## Основные возможности

### Auth + RBAC

- регистрация;
- login;
- refresh token rotation;
- `/me`;
- роли;
- permissions;
- admin role management.

### Projects

- создание проекта;
- мультиязычные описания `ru/kg/en`;
- категории;
- статусы проекта;
- state machine;
- модерация;
- audit log.

### Payments + Ledger

- mock payment в TEST MODE;
- idempotency key;
- подтверждение оплаты;
- platform fee rules;
- ledger entries;
- project financial summary;
- refund.

### Community

- комментарии;
- жалобы;
- модерация жалоб;
- внутренние уведомления.

### CMS

- CMS pages;
- banners;
- static translations dictionary.

### Admin API

- dashboard;
- users management;
- projects moderation;
- payments and ledger;
- refunds;
- reports moderation;
- complaints moderation;
- audit logs;
- roles and permissions.

## Полезные команды

Применить миграции:

```bash
docker compose run --rm backend alembic upgrade head
```

Создать новую миграцию:

```bash
docker compose run --rm backend alembic revision --autogenerate -m "migration message"
```

Запустить тесты:

```bash
docker compose run --rm backend pytest
```

Запустить demo seed:

```bash
docker compose run --rm backend python -m app.db.seed_demo
```

Остановить контейнеры:

```bash
docker compose down
```

## Архитектура

Документация проекта находится в папке `docs/`.

Основные документы:

- `docs/API.md`
- `docs/API_QUICK_REFERENCE.md`
- `docs/ARCHITECTURE.md`
- `docs/TEST_MODE.md`
- `docs/DEMO.md`
- `docs/BACKEND_CHECKLIST.md`

## Важное про финансы

В проекте нет поля вида `project.collected_amount`, которое вручную увеличивается при оплате.

Суммы считаются через `ledger_entries`:

- `PROJECT_GROSS`
- `PLATFORM_FEE`
- `PROJECT_NET`
- `REFUND`
- `ADMIN_ADJUSTMENT`

Это делает финансовую историю проверяемой и удобной для audit/debug.

## Git workflow

Основная ветка разработки:

```bash
develop
```

Рекомендуемый порядок:

```bash
git status
git add .
git commit -m "type(scope): short description"
git push
```

Пример:

```bash
git commit -m "feat(payments): confirm mock payment with ledger entries"
```
