# API BirgeFund

Базовый префикс API:

~~~text
/api
~~~

Версия API:

~~~text
/api/v1
~~~

## Healthcheck

~~~text
GET /api/health
~~~

Ответ:

~~~json
{
  "status": "ok"
}
~~~

## Auth

~~~text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
~~~

## Projects

~~~text
GET    /api/projects
GET    /api/projects/{slug}
POST   /api/projects
PATCH  /api/projects/{id}
POST   /api/projects/{id}/submit-review
POST   /api/projects/{id}/support
GET    /api/projects/{id}/updates
POST   /api/projects/{id}/updates
GET    /api/projects/{id}/reports
POST   /api/projects/{id}/reports
~~~

## Mock payments

~~~text
POST /api/payments/mock/create
POST /api/payments/mock/confirm
GET  /api/payments/my
POST /api/payments/{id}/refund
~~~

## User dashboard

~~~text
GET    /api/me/supports
GET    /api/me/transactions
GET    /api/me/favorites
POST   /api/me/favorites/{project_id}
DELETE /api/me/favorites/{project_id}
GET    /api/me/notifications
~~~

## Admin

~~~text
GET   /api/admin/dashboard

GET   /api/admin/users
PATCH /api/admin/users/{id}

GET   /api/admin/authors
PATCH /api/admin/authors/{id}/verification

GET   /api/admin/projects
PATCH /api/admin/projects/{id}
PATCH /api/admin/projects/{id}/status

GET   /api/admin/payments
GET   /api/admin/ledger
POST  /api/admin/payments/{id}/refund

GET   /api/admin/complaints
PATCH /api/admin/complaints/{id}

GET   /api/admin/reports
PATCH /api/admin/reports/{id}/status

GET   /api/admin/audit-logs

GET   /api/admin/settings
PATCH /api/admin/settings
~~~

## CMS

~~~text
GET    /api/cms/pages/{slug}
GET    /api/admin/cms/pages
POST   /api/admin/cms/pages
PATCH  /api/admin/cms/pages/{id}
~~~

## Translations

~~~text
GET    /api/admin/translations
POST   /api/admin/translations/import
GET    /api/admin/translations/export
PATCH  /api/admin/translations/{id}
~~~

## Banners

~~~text
GET    /api/banners
GET    /api/admin/banners
POST   /api/admin/banners
PATCH  /api/admin/banners/{id}
DELETE /api/admin/banners/{id}
~~~

## Общий формат ошибки

~~~json
{
  "detail": "Описание ошибки",
  "code": "ERROR_CODE"
}
~~~

## Pagination

Для списков используется единый формат:

~~~json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
~~~

## Auth header

Для защищённых эндпоинтов:

~~~text
Authorization: Bearer <access_token>
~~~

## Permissions

Примеры permissions:

~~~text
users.read
users.update
users.block
projects.create
projects.update
projects.moderate
projects.freeze
payments.read
payments.refund
reports.moderate
complaints.manage
settings.update
translations.update
audit.read
cms.update
~~~

## Важные API-правила

1. Удаление финансовых операций не реализуется.
2. Refund доступен только через отдельный endpoint и требует причину.
3. Смена статуса проекта идёт только через status endpoint.
4. Все admin endpoints требуют permissions.
5. Mock payment confirm должен быть защищён от дублей через idempotency.
6. В ответах API технические enum можно отдавать, но frontend обязан показывать человеческие названия.
