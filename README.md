# BirgeFund

Мультиязычная production-like краудфандинговая платформа для социальных, образовательных, творческих и малых бизнес-проектов в Кыргызстане.

Проект создаётся как демонстрационный fullstack-проект для портфолио.  
Платформа показывает работу авторизации, ролей, модерации, админки, mock-платежей, ledger, refund, audit log и i18n.

## Важно: TEST MODE

BirgeFund не является инвестиционной платформой, платёжной организацией, электронным кошельком или финансовым продуктом.

В demo-версии:

- реальные деньги не принимаются;
- данные банковских карт не вводятся;
- CVV, номер карты и срок карты не запрашиваются;
- выплаты авторам не выполняются;
- инвестиции, проценты и доходность не обещаются;
- все платежи работают только в TEST MODE.

Пользователь может только имитировать поддержку проекта через mock payment.

## Основные возможности

### Публичная часть

- главная страница;
- каталог проектов;
- поиск и фильтры;
- детальная страница проекта;
- публичные отчёты;
- FAQ и CMS-страницы;
- переключение языка: `ru`, `kg`, `en`.

### Пользователь

- регистрация и вход;
- профиль;
- избранные проекты;
- история поддержек;
- история тестовых операций;
- комментарии;
- жалобы;
- mock payment.

### Автор проекта

- создание проекта;
- черновики;
- отправка проекта на модерацию;
- новости проекта;
- отчёты проекта;
- просмотр поддержавших;
- статистика проекта.

### Админка

- dashboard;
- управление пользователями;
- управление авторами;
- модерация проектов;
- тестовые платежи;
- ledger;
- refund;
- жалобы;
- отчёты;
- CMS-страницы;
- переводы;
- баннеры;
- audit log;
- настройки платформы.

## Стек

### Backend

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- Pydantic
- Redis
- JWT
- pytest
- Docker Compose

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- i18next

### Инфраструктура

- Docker
- Docker Compose
- Nginx
- PostgreSQL
- Redis
- GitHub Actions

## Архитектура

Общая схема:

```text
Frontend React/Vite
        |
        | REST API / JSON
        v
Backend FastAPI
        |
        | SQLAlchemy / Alembic
        v
PostgreSQL

Redis
 ├─ rate limit
 ├─ cache
 └─ future background jobs

Docker Compose
 ├─ backend
 ├─ frontend
 ├─ postgres
 ├─ redis
 └─ nginx
```

Backend строится по принципу:

```text
router -> service -> repository -> database
```

Где:

- `router` принимает HTTP-запрос;
- `schema` валидирует входные и выходные данные;
- `service` содержит бизнес-логику;
- `repository` работает с базой данных;
- `model` описывает таблицы;
- `permissions` проверяет права доступа;
- `audit` записывает важные действия.

## Структура проекта

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── modules/
│   │   ├── shared/
│   │   └── main.py
│   ├── alembic/
│   ├── pyproject.toml
│   ├── alembic.ini
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── entities/
│   │   ├── shared/
│   │   └── styles/
│   └── Dockerfile
├── infra/
│   └── nginx/
├── docs/
├── scripts/
├── storage/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Основные backend-модули

```text
auth
users
roles
authors
projects
categories
rewards
payments
ledger
refunds
comments
complaints
reports
files
notifications
cms
translations
banners
admin
audit
settings
```

## Финансовая логика

Главное правило: финансовые суммы нельзя менять вручную.

Нельзя делать так:

```python
project.collected_amount = 10000
user.balance = 5000
```

Правильно:

- успешная mock-оплата создаёт `payment_attempt`;
- затем создаются записи в `ledger_entries`;
- отображаемая сумма проекта считается через ledger;
- refund создаётся обратной операцией;
- старые финансовые операции не удаляются.

Пример ledger для поддержки на 10 000 сом с комиссией 7%:

```text
PROJECT_GROSS +10000
PLATFORM_FEE -700
PROJECT_NET +9300
```

Для отображения:

```text
gross_collected = SUM(PROJECT_GROSS) - SUM(REFUND)
net_amount = SUM(PROJECT_NET)
platform_fee_amount = SUM(PLATFORM_FEE)
```

## Project state machine

Статус проекта меняется только через сервис:

```python
ProjectStatusService.change_status(project, new_status, actor)
```

Каждая смена статуса записывается в audit log.

Разрешённые переходы:

```text
draft -> pending_review
pending_review -> approved
pending_review -> rejected
rejected -> draft
approved -> fundraising
fundraising -> funded
fundraising -> failed
fundraising -> cancelled
fundraising -> frozen
frozen -> fundraising
frozen -> cancelled
funded -> in_progress
in_progress -> completed
in_progress -> frozen
```

Запрещено:

```text
completed -> fundraising
completed -> draft
failed -> fundraising без решения админа
cancelled -> fundraising
```

## Как запустить проект

Скопировать переменные окружения:

```bash
cp .env.example .env
```

Запустить контейнеры:

```bash
docker compose up --build
```

Остановить контейнеры:

```bash
docker compose down
```

Остановить контейнеры и удалить volumes:

```bash
docker compose down -v
```

## Миграции

Создать миграцию:

```bash
docker compose exec backend alembic revision --autogenerate -m "init"
```

Применить миграции:

```bash
docker compose exec backend alembic upgrade head
```

Откатить последнюю миграцию:

```bash
docker compose exec backend alembic downgrade -1
```

## Seed data

Создать тестовые данные:

```bash
docker compose exec backend python -m app.db.init_db
```

Seed должен создать:

- demo-пользователей;
- роли и permissions;
- категории;
- проекты;
- reward-пакеты;
- тестовые платежи;
- ledger entries;
- жалобы;
- отчёты;
- переводы.

## Demo-аккаунты

После запуска seed data доступны demo-аккаунты:

| Роль | Email |
|---|---|
| Super Admin | admin@example.com |
| Moderator | moderator@example.com |
| Author | author@example.com |
| User | user@example.com |
| Financial Manager | finance@example.com |
| Content Manager | content@example.com |

Пароль задаётся в seed-скрипте. Для demo можно использовать единый пароль:

```text
DemoPass123!
```

## Основные API-разделы

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Projects

```text
GET    /api/projects
GET    /api/projects/{slug}
POST   /api/projects
PATCH  /api/projects/{id}
POST   /api/projects/{id}/submit-review
GET    /api/projects/{id}/updates
GET    /api/projects/{id}/reports
```

### Mock payments

```text
POST /api/payments/mock/create
POST /api/payments/mock/confirm
GET  /api/payments/my
POST /api/payments/{id}/refund
```

### Admin

```text
GET   /api/admin/dashboard
GET   /api/admin/users
GET   /api/admin/projects
GET   /api/admin/payments
GET   /api/admin/ledger
GET   /api/admin/complaints
GET   /api/admin/reports
GET   /api/admin/audit-logs
```

## Demo-сценарии проверки

Проверить проект можно по таким сценариям:

1. Зарегистрироваться.
2. Войти в аккаунт.
3. Создать проект как автор.
4. Отправить проект на модерацию.
5. Одобрить проект через админку.
6. Открыть публичную страницу проекта.
7. Поддержать проект через mock payment.
8. Проверить, что реальные платёжные данные не вводятся.
9. Проверить создание `payment_attempt`.
10. Проверить записи в `ledger_entries`.
11. Сделать test refund с причиной.
12. Проверить audit log.
13. Добавить отчёт проекта.
14. Подать жалобу.
15. Обработать жалобу в админке.
16. Переключить язык `ru / kg / en`.

## Тесты

Backend-тесты:

```bash
docker compose exec backend pytest
```

Frontend build:

```bash
docker compose exec frontend npm run build
```

Frontend lint:

```bash
docker compose exec frontend npm run lint
```

## Правила разработки

### Backend

- бизнес-логику писать в `service.py`;
- работу с БД держать в `repository.py`;
- HTTP-логику держать в `router.py`;
- Pydantic-схемы держать в `schema.py`;
- права доступа проверять через permissions;
- важные действия писать в audit log.

### Frontend

- все тексты интерфейса через i18n;
- русский язык — fallback;
- технические enum-значения не показывать пользователю;
- опасные действия подтверждать через confirm modal;
- refund только с причиной;
- финансовые операции нельзя удалять или редактировать в UI;
- TEST MODE показывать везде, где есть платежи.

## Запрещённые формулировки

В интерфейсе нельзя писать:

- инвестируйте и получите доход;
- гарантированный доход;
- получите прибыль;
- пассивный доход;
- вернём вклад;
- безрисковая инвестиция;
- дивиденды;
- проценты.

Можно писать:

- поддержать проект;
- помочь автору запустить проект;
- получить вознаграждение;
- предзаказать товар;
- получить отчёт;
- поддержать социальную инициативу.

## Что переносится во второй этап

Во второй этап переносится:

- реальные платежи;
- интеграция с банком;
- вывод денег авторам;
- investment/profit-sharing;
- Telegram notifications;
- Prometheus/Grafana;
- Sentry;
- сложный trust score;
- полная история входов;
- сложная KYC-проверка;
- автоматическая проверка документов;
- сложный SEO canonical;
- реальная email-рассылка.

## Статус проекта

Проект находится в разработке.

Первый этап:

- структура репозитория;
- базовый README;
- документация;
- Docker Compose;
- backend foundation;
- frontend foundation.