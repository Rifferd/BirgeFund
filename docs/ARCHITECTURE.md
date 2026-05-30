# Архитектура BirgeFund

BirgeFund — production-like demo краудфандинговой платформы для Кыргызстана.

Проект строится как fullstack-приложение:

~~~text
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

Local Storage
 └─ files: images/pdf, структура готова под S3/MinIO

Docker Compose
 ├─ backend
 ├─ frontend
 ├─ postgres
 ├─ redis
 └─ nginx
~~~

## Backend

Backend строится модульно:

~~~text
backend/app
├── api
├── core
├── db
├── modules
├── shared
└── main.py
~~~

Главный принцип:

~~~text
router -> service -> repository -> database
~~~

Где:

- `router.py` принимает HTTP-запросы;
- `schema.py` валидирует входные и выходные данные;
- `service.py` содержит бизнес-логику;
- `repository.py` работает с базой данных;
- `model.py` описывает таблицы;
- `permissions.py` проверяет права;
- `audit` фиксирует важные действия.

## Основные backend-модули

~~~text
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
~~~

## Frontend

Frontend строится на React + TypeScript + Vite.

Структура:

~~~text
frontend/src
├── app
├── layouts
├── pages
├── features
├── entities
├── shared
└── styles
~~~

Основные layout:

- `PublicLayout` — публичные страницы;
- `DashboardLayout` — пользователь и автор;
- `AdminLayout` — админка.

## База данных

Основные группы таблиц:

~~~text
Auth/RBAC:
users
roles
permissions
user_roles
role_permissions
refresh_tokens

Authors:
author_profiles
author_documents

Projects:
projects
project_translations
project_categories
project_rewards
project_updates
project_reports
project_report_files

Finance:
payment_attempts
ledger_entries
refunds
platform_fee_rules

Interaction:
comments
complaints
notifications
favorites

Content:
cms_pages
cms_page_translations
translations
banners

System:
files
audit_logs
site_settings
~~~

## Главные архитектурные правила

1. Статус проекта меняется только через `ProjectStatusService`.
2. Каждая смена статуса записывается в `audit_logs`.
3. Финансовые операции нельзя удалять.
4. Собранная сумма проекта считается через `ledger_entries`.
5. Refund создаётся обратной операцией.
6. Mock payment должен использовать `idempotency_key`.
7. Все тексты интерфейса идут через i18n.
8. Русский язык используется как fallback.
9. В demo-версии нет реальных платежей.
10. В UI нельзя использовать инвестиционные обещания.

## Project status flow

~~~text
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
~~~

Запрещённые переходы:

~~~text
completed -> fundraising
completed -> draft
failed -> fundraising без решения админа
cancelled -> fundraising
~~~

## Финансовая модель

Нельзя делать так:

~~~python
project.collected_amount = 10000
user.balance = 5000
~~~

Правильно:

~~~text
payment_attempt -> ledger_entries -> calculated totals
~~~

Пример поддержки на 10 000 сом с комиссией 7%:

~~~text
PROJECT_GROSS +10000
PLATFORM_FEE -700
PROJECT_NET +9300
~~~

Для отображения:

~~~text
gross_collected = SUM(PROJECT_GROSS) - SUM(REFUND)
net_amount = SUM(PROJECT_NET)
platform_fee_amount = SUM(PLATFORM_FEE)
~~~

## Расширяемость

Проект специально разделён на модули, чтобы можно было добавлять новые функции без поломки старых частей.

Например:

- добавить новый тип проекта;
- добавить новый способ mock payment;
- подключить S3/MinIO вместо local storage;
- подключить Celery/RQ;
- добавить Sentry;
- добавить Prometheus/Grafana;
- заменить mock payment на реальный платёжный провайдер во второй версии.
