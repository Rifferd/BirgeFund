# BirgeFund — backend checklist

Документ фиксирует текущее состояние backend-части проекта и помогает быстро проверить, что реализовано.

## 1. Core

- [x] FastAPI backend
- [x] PostgreSQL
- [x] Redis
- [x] Docker Compose
- [x] Alembic migrations
- [x] Pydantic schemas
- [x] Единый формат ошибок
- [x] Healthcheck endpoint

Проверка:

```bash
curl http://localhost:8000/api/health
```

## 2. Auth / RBAC

- [x] Регистрация
- [x] Login
- [x] Access token
- [x] Refresh token
- [x] `/me`
- [x] Роли
- [x] Permissions
- [x] Admin role management
- [x] Permission seed

Demo users создаются через:

```bash
docker compose run --rm backend python -m app.db.seed_demo
```

## 3. Projects

- [x] Создание проекта
- [x] Редактирование draft/rejected проекта
- [x] Мультиязычные переводы проекта
- [x] Категории
- [x] Project status state machine
- [x] Отправка на модерацию
- [x] Admin moderation
- [x] Audit log статусов
- [x] Ledger summary в ответе проекта

Основной demo-проект:

```bash
curl http://localhost:8000/api/projects/demo-school-library
```

## 4. Rewards / Updates / Reports / Files

- [x] Rewards
- [x] Project updates
- [x] Project reports
- [x] Report moderation
- [x] Local file storage
- [x] File validation
- [x] Images: jpg/jpeg/png/webp
- [x] PDF support
- [x] Size limits

## 5. Payments / Ledger / Refunds

- [x] TEST MODE
- [x] Mock payment create
- [x] Idempotency key
- [x] Mock payment confirm
- [x] Platform fee rules
- [x] Immutable ledger entries
- [x] Ledger summary
- [x] Refund model
- [x] Refund service
- [x] Refund permissions
- [x] Finance admin endpoints

Важно: суммы проекта считаются через `ledger_entries`, а не через ручное поле в `projects`.

Ledger types:

- `PROJECT_GROSS`
- `PLATFORM_FEE`
- `PROJECT_NET`
- `REFUND`
- `ADMIN_ADJUSTMENT`

Проверка summary:

```bash
curl http://localhost:8000/api/ledger/projects/PROJECT_ID/summary
```

## 6. Community

- [x] Comments
- [x] Comment moderation
- [x] Complaints
- [x] Complaint moderation
- [x] Internal notifications
- [x] Mark notification as read
- [x] Mark all notifications as read

## 7. Admin API

- [x] Dashboard stats
- [x] Users management
- [x] User block/unblock
- [x] Projects moderation
- [x] Finance endpoints
- [x] Ledger endpoints
- [x] Refund endpoints
- [x] Reports moderation
- [x] Complaints moderation
- [x] Audit logs
- [x] Roles management
- [x] Permissions seed

## 8. CMS

- [x] CMS pages
- [x] Multilingual CMS translations
- [x] Banners
- [x] Static translations dictionary
- [x] Public translations endpoint
- [x] Admin translations CRUD

Проверка:

```bash
curl "http://localhost:8000/api/translations?language=ru"
curl http://localhost:8000/api/cms/pages/test-mode
curl http://localhost:8000/api/banners
```

## 9. Demo scenario

- [x] Demo seed
- [x] Demo users
- [x] Demo categories
- [x] Demo CMS
- [x] Demo banners
- [x] Demo translations
- [x] Demo fundraising project
- [x] Demo pending review project
- [x] Demo successful payment
- [x] Demo ledger entries
- [x] Smoke test script

Запуск:

```bash
docker compose up -d postgres redis
docker compose run --rm backend alembic upgrade head
docker compose run --rm backend python -m app.db.seed_demo
docker compose up --build backend
```

В другом терминале:

```bash
./scripts/smoke_demo.sh
```

## 10. Test commands

Backend tests:

```bash
docker compose run --rm backend pytest
```

Smoke test:

```bash
./scripts/smoke_demo.sh
```

## 11. Что осталось для frontend

Frontend должен опираться на эти backend-блоки:

- публичная главная;
- список проектов;
- страница проекта;
- login/register;
- личный кабинет автора;
- создание проекта;
- mock payment flow;
- admin dashboard;
- admin moderation;
- admin CMS;
- notifications.

## 12. Demo credentials

| Роль | Email | Пароль |
|---|---|---|
| Super Admin | `admin@birgefund.kg` | `AdminPass123!` |
| Moderator | `moderator@birgefund.kg` | `ModeratorPass123!` |
| Finance Manager | `finance@birgefund.kg` | `FinancePass123!` |
| Content Manager | `content@birgefund.kg` | `ContentPass123!` |
| Author | `author@birgefund.kg` | `AuthorPass123!` |
| Backer | `backer@birgefund.kg` | `BackerPass123!` |
