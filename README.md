# auth-flow

Next.js-приложение с двумя способами входа: **email + пароль** (JWT в httpOnly-cookies и refresh-токены в PostgreSQL) и **OAuth** (Google / GitHub через NextAuth).

## Стек и технологии

| Категория | Что используется |
|-----------|-------------------|
| **Фреймворк** | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19 |
| **Язык** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Стили** | [Tailwind CSS](https://tailwindcss.com/) 4 (`@tailwindcss/postcss`) |
| **База данных** | [PostgreSQL](https://www.postgresql.org/), [Prisma](https://www.prisma.io/) 7 (`@prisma/client`), драйвер [`pg`](https://node-postgres.com/), адаптер [`@prisma/adapter-pg`](https://www.prisma.io/docs/orm/overview/databases/postgresql) |
| **Аутентификация** | [NextAuth.js](https://next-auth.js.org/) v4, адаптер [`@auth/prisma-adapter`](https://authjs.dev/reference/adapter/prisma), JWT — [`jose`](https://github.com/panva/jose), хеш паролей — [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js) |
| **Формы и валидация** | [React Hook Form](https://react-hook-form.com/), [`@hookform/resolvers`](https://github.com/react-hook-form/resolvers), [Zod](https://zod.dev/) |
| **Клиентское состояние / запросы** | [TanStack Query](https://tanstack.com/query) (React Query) |
| **Почта** | [Resend](https://resend.com/), шаблоны — [`@react-email/components`](https://react.email/) |
| **Ограничение частоты запросов** | [Upstash Redis](https://upstash.com/) (`@upstash/redis`, `@upstash/ratelimit`) |
| **UI-компоненты и UX** | Локальные примитивы в `src/components/ui/`, иконки — [Lucide React](https://lucide.dev/), уведомления — [React Toastify](https://fkhadra.github.io/react-toastify/introduction), утилита классов — [`clsx`](https://github.com/lukeed/clsx) + [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) |
| **Линтинг** | [ESLint](https://eslint.org/) 9, [`eslint-config-next`](https://nextjs.org/docs/app/api-reference/config/eslint) |

Версии пакетов смотрите в [`package.json`](package.json).

## Требования

- Node.js 20+
- [pnpm](https://pnpm.io/)
- PostgreSQL

## Переменные окружения

Создайте `.env` в корне проекта. Обязательные переменные проверяются в [`src/shared/utils/validateEnv.ts`](src/shared/utils/validateEnv.ts):

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Строка подключения PostgreSQL для Prisma |
| `DIRECT_URL` | Опционально: прямой URL к БД для миграций (если `DATABASE_URL` идёт через пулер) |
| `NEXTAUTH_URL` | Публичный URL приложения, например `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Секрет NextAuth, **не короче 32 символов** |
| `JWT_SECRET` | Секрет для подписи access/refresh JWT (`jose`), **не короче 32 символов** |
| `RESEND_API_KEY` | API-ключ [Resend](https://resend.com/) для писем |
| `EMAIL_FROM` | Отправитель писем, например `Auth <onboarding@yourdomain.com>` |

Опционально:

| Переменная | Назначение |
|------------|------------|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit (Upstash Redis). Без них лимит отключён; в production в лог пишется предупреждение |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | OAuth GitHub |

## Установка и запуск

```bash
pnpm install
pnpm exec prisma migrate dev   # при первой настройке БД
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Сборка:

```bash
pnpm build
pnpm start
```

Перед первой сборкой или после изменения схемы выполните:

```bash
pnpm exec prisma generate
```

## Как устроен auth flow

### Email и пароль

1. **Регистрация** — `POST /api/auth/register`: хеш пароля (bcrypt), в БД сохраняется хеш verification-токена, на почту уходит ссылка вида `{NEXTAUTH_URL}/api/auth/verify-email?token=...`.
2. **Подтверждение email** — `GET /api/auth/verify-email?token=...`: выставляет `emailVerified`, очищает токен, редирект на `/dashboard`.
3. **Вход** — `POST /api/auth/login`: проверка пароля и того, что email подтверждён; выдаётся пара JWT (access ~15 мин, refresh ~7 дней). В БД сохраняется **refresh** (`RefreshToken`). В ответ выставляются httpOnly-cookies `access_token` и `refresh_token`.
4. **Текущий пользователь** — `GET /api/auth/me`: читает `access_token`, проверяет JWT, возвращает профиль.
5. **Обновление сессии** — `POST /api/auth/refresh`: по cookie `refresh_token` ротирует refresh (семейство токенов отзывается при ротации), обновляет cookies.
6. **Выход** — `POST /api/auth/logout`: отзыв refresh в БД, очистка cookies.

Клиентский HTTP-слой: [`src/modules/core/api/api-client.ts`](src/modules/core/api/api-client.ts) — при `401` один раз пытается `POST /api/auth/refresh` и повторяет запрос (кроме исключённых эндпоинтов).

### Сброс пароля

- `POST /api/auth/forgot-password` — создаёт запись `PasswordReset` и отправляет письмо на `{NEXTAUTH_URL}/reset-password?token=...`.
- `POST /api/auth/reset-password` — новый пароль, инвалидация всех refresh-токенов пользователя.

### OAuth (NextAuth)

Маршрут: `/api/auth/[...nextauth]`. Провайдеры подключаются только если заданы соответствующие env. Сессия NextAuth — **JWT**; в [`getUserId`](src/modules/auth/server/getUserId.ts) сначала берётся сессия OAuth, затем access JWT из cookie.

## API (кратко)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| GET | `/api/auth/verify-email` | Подтверждение email (редирект) |
| POST | `/api/auth/login` | Вход (cookies) |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/auth/refresh` | Обновление токенов |
| POST | `/api/auth/logout` | Выход |
| POST | `/api/auth/send-verification` | Повторная отправка письма (нужна авторизация по access/OAuth) |
| POST | `/api/auth/forgot-password` | Запрос сброса пароля |
| POST | `/api/auth/reset-password` | Установка нового пароля |
| * | `/api/auth/[...nextauth]` | NextAuth |

## Структура БД (Prisma)

См. [`prisma/schema.prisma`](prisma/schema.prisma): `User`, `Account`, `Session` (модели для NextAuth), `RefreshToken`, `PasswordReset`.

## UI

Код лежит в [`src/components/ui/`](src/components/ui/) (кнопка, поля, карточка); см. также таблицу «UI-компоненты и UX» выше.

## Замечания по безопасности и эксплуатации

- В production задайте Upstash для rate limiting на чувствительных маршрутах, иначе лимит выключен.
- Письма через Resend: без `RESEND_API_KEY` отправка упадёт в рантайме при вызове функций из [`src/modules/auth/server/email.ts`](src/modules/auth/server/email.ts).
- Страница [`/dashboard`](src/app/dashboard/page.tsx) — заглушка после верификации; ограничение доступа по маршрутам можно добавить через middleware и проверку cookies/сессии.
