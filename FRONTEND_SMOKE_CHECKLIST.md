# BirgeFund Frontend Smoke Checklist

## Public
- [ ] `/` открывается без белого экрана
- [ ] `/projects` грузит проекты из backend
- [ ] `/projects/demo-school-library` грузит detail page
- [ ] `/pages/test-mode` грузит CMS page
- [ ] Баннеры на главной берутся из backend
- [ ] 404 route показывает красивую страницу

## Auth
- [ ] Login backer работает
- [ ] Logout работает
- [ ] `/dashboard` без токена перекидывает на `/login`
- [ ] `/dashboard` после login открывается
- [ ] `/auth/me` показывает roles, role_names, permissions

## Access
- [ ] Backer при входе в `/admin` видит 403
- [ ] Admin открывает `/admin`
- [ ] Moderator/finance/content открывают `/admin`, но backend может ограничивать отдельные страницы
- [ ] Admin layout не рендерится для backer

## Project support
- [ ] Backer может открыть `/projects/demo-school-library/support`
- [ ] Mock payment create работает
- [ ] Mock payment confirm работает
- [ ] После оплаты сумма проекта обновляется

## Comments / complaints
- [ ] Комментарий к проекту создаётся
- [ ] Жалоба создаётся только на проект
- [ ] Жалоба появляется в `/admin/complaints`
- [ ] Модератор закрывает жалобу с `moderator_comment`

## Author
- [ ] Author видит `/author/projects`
- [ ] Author создаёт проект
- [ ] Author отправляет проект на модерацию
- [ ] Author управляет updates/reports/rewards

## Admin
- [ ] `/admin/projects` модерирует проекты
- [ ] `/admin/users` грузит пользователей
- [ ] `/admin/payments` грузит платежи
- [ ] `/admin/ledger` грузит ledger по Project ID
- [ ] `/admin/refunds` показывает refunds
- [ ] `/admin/reports` модерирует отчёты
- [ ] `/admin/cms` редактирует CMS pages
- [ ] `/admin/banners` редактирует banners
- [ ] `/admin/translations` редактирует translations

## Responsive
- [ ] Главная норм на mobile
- [ ] Project detail норм на mobile
- [ ] Dashboard sidebar/drawer норм на mobile
- [ ] Admin tables переходят в cards на mobile
