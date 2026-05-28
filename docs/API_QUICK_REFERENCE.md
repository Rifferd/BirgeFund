# BirgeFund — API quick reference

Базовый URL: http://localhost:8000/api

Swagger UI: http://localhost:8000/docs

## Health

| Method | Endpoint | Описание |
|---|---|---|
| GET | /health | Проверка backend |

## Auth

| Method | Endpoint | Описание |
|---|---|---|
| POST | /auth/register | Регистрация |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Logout |
| GET | /auth/me | Текущий пользователь |

## Public

| Method | Endpoint | Описание |
|---|---|---|
| GET | /categories | Список категорий |
| GET | /projects | Публичные проекты |
| GET | /projects/{slug} | Проект по slug |
| GET | /projects/{project_id}/rewards | Rewards проекта |
| GET | /projects/{project_id}/updates | Новости проекта |
| GET | /projects/{project_id}/reports | Публичные отчёты |
| GET | /projects/{project_id}/comments | Комментарии |
| GET | /cms/pages | Публичные CMS-страницы |
| GET | /cms/pages/{slug} | CMS-страница по slug |
| GET | /banners | Активные баннеры |
| GET | /translations?language=ru | UI-переводы |

## User project flow

| Method | Endpoint | Описание |
|---|---|---|
| GET | /projects/my | Мои проекты |
| POST | /projects | Создать draft-проект |
| PATCH | /projects/{project_id} | Редактировать draft/rejected |
| POST | /projects/{project_id}/submit-review | Отправить на модерацию |
| POST | /projects/{project_id}/rewards | Добавить reward |
| PATCH | /rewards/{reward_id} | Обновить reward |
| POST | /projects/{project_id}/updates | Создать update |
| GET | /projects/{project_id}/updates/my | Мои updates проекта |
| POST | /projects/{project_id}/reports | Создать отчёт |
| GET | /projects/{project_id}/reports/my | Мои отчёты проекта |
| PATCH | /reports/{report_id} | Редактировать отчёт |
| POST | /reports/{report_id}/submit-review | Отправить отчёт на проверку |

## Files

| Method | Endpoint | Описание |
|---|---|---|
| POST | /files/upload | Загрузка файла |
| GET | /files/{file_id} | Metadata файла |

Поддержка файлов:

- images: jpg, jpeg, png, webp;
- pdf;
- image limit: 5 MB;
- pdf limit: 10 MB.

## Payments

| Method | Endpoint | Описание |
|---|---|---|
| POST | /payments/mock/create | Создать тестовую оплату |
| POST | /payments/mock/confirm | Подтвердить тестовую оплату |
| GET | /payments/my | Мои оплаты |
| GET | /payments/fee-rules | Правила комиссии |
| POST | /payments/fee-rules/defaults | Создать default fee rules |
| PUT | /payments/fee-rules | Upsert fee rule |

## Ledger

| Method | Endpoint | Описание |
|---|---|---|
| GET | /ledger/projects/{project_id} | Ledger проекта |
| GET | /ledger/projects/{project_id}/summary | Финансовый summary проекта |
| GET | /ledger/my | Мои ledger entries |

## Refunds

| Method | Endpoint | Описание |
|---|---|---|
| POST | /payments/{payment_attempt_id}/refund | Создать test refund |
| GET | /projects/{project_id}/refunds | Refunds проекта |

## Community

| Method | Endpoint | Описание |
|---|---|---|
| POST | /projects/{project_id}/comments | Создать комментарий |
| PATCH | /comments/{comment_id} | Редактировать свой комментарий |
| POST | /complaints | Создать жалобу |
| GET | /complaints/my | Мои жалобы |
| GET | /notifications/my | Мои уведомления |
| GET | /notifications/unread-count | Количество непрочитанных |
| PATCH | /notifications/{notification_id}/read | Отметить уведомление прочитанным |
| PATCH | /notifications/read-all | Отметить все прочитанными |

## Admin

| Method | Endpoint | Permission |
|---|---|---|
| GET | /admin/dashboard | admin.dashboard |
| GET | /admin/users | users.read |
| GET | /admin/users/{user_id} | users.read |
| PATCH | /admin/users/{user_id} | users.update |
| PATCH | /admin/users/{user_id}/block | users.block |
| PATCH | /admin/users/{user_id}/unblock | users.block |
| GET | /admin/projects | projects.moderate |
| GET | /admin/projects/{project_id} | projects.moderate |
| PATCH | /admin/projects/{project_id}/status | projects.moderate / projects.freeze |
| GET | /admin/payments | payments.read |
| GET | /admin/payments/{payment_id} | payments.read |
| POST | /admin/payments/{payment_id}/refund | payments.refund |
| GET | /admin/ledger/projects/{project_id} | payments.read |
| GET | /admin/ledger/projects/{project_id}/summary | payments.read |
| GET | /admin/refunds | payments.read |
| GET | /admin/reports | reports.moderate |
| PATCH | /admin/reports/{report_id}/status | reports.moderate |
| GET | /admin/complaints | complaints.manage |
| PATCH | /admin/complaints/{complaint_id}/status | complaints.manage |
| GET | /admin/audit-logs | audit.read |
| GET | /admin/audit-logs/{audit_log_id} | audit.read |
| GET | /admin/permissions | users.read |
| POST | /admin/permissions/seed | users.update |
| GET | /admin/roles | users.read |
| POST | /admin/roles | users.update |
| POST | /admin/users/{user_id}/roles | users.update |

## Admin CMS

| Method | Endpoint | Permission |
|---|---|---|
| GET | /admin/cms/pages | cms.update |
| POST | /admin/cms/pages | cms.update |
| PATCH | /admin/cms/pages/{page_id} | cms.update |
| GET | /admin/banners | cms.update |
| POST | /admin/banners | cms.update |
| PATCH | /admin/banners/{banner_id} | cms.update |
| GET | /admin/translations | translations.update |
| POST | /admin/translations/seed | translations.update |
| POST | /admin/translations | translations.update |
| PATCH | /admin/translations/{translation_id} | translations.update |

## Demo login

Admin login:

curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@birgefund.kg","password":"AdminPass123!"}'

## Smoke test

./scripts/smoke_demo.sh
