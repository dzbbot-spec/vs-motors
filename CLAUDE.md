# CLAUDE.md — VS MOTORS

Этот файл читается автоматически при каждом запуске Claude Code в этой папке.
Здесь — весь контекст проекта для продолжения работы в новом чате.

---

## Что за проект

**VS MOTORS** — Telegram Mini App + бот. Личная витрина автомобилей одного продавца.
- Один владелец размещает объявления через встроенную админку
- Пользователи смотрят и связываются (Telegram, WhatsApp, телефон)
- Без регистрации, без монетизации, без фильтров — чистая витрина

---

## Документация проекта

Все решения, спецификации и задачи — в этих файлах (читай их перед работой):

| Файл | Что внутри |
|---|---|
| `SPEC.md` | Полная спецификация: страницы, API, БД, ENV, стек |
| `TODO.md` | Задачи по 12 этапам разработки |
| `PROGRESS.md` | Текущий статус каждого этапа и компонента |
| `DECISIONS.md` | Архитектурные решения с обоснованием (читать обязательно!) |
| `TESTING_CHECKLIST.md` | Чеклист перед деплоем |
| `DISASTER_RECOVERY.md` | Что делать если что-то упало |
| `CHANGELOG.md` | История версий |

---

## Текущий статус

> ⚠️ **Обновляй эту секцию каждый раз после завершения этапа**

**Текущий этап:** Этап 12 — Продакшн  
**Последнее действие:** Этапы 1–11 завершены — весь бэкенд и фронтенд готовы  
**Следующий шаг:** Пройти TESTING_CHECKLIST, проверить все ENV в продакшне, тест на реальном устройстве

Подробный статус каждого компонента — в `PROGRESS.md`.

---

## Технологический стек

| Слой | Технология |
|---|---|
| Frontend | React 18 + Vite + TypeScript + @twa-dev/sdk |
| Backend | FastAPI + aiogram 3 + asyncpg |
| БД | PostgreSQL на Supabase |
| Фото | Cloudinary (signed upload) |
| Хостинг бэкенд | Render (Free tier) |
| Хостинг фронтенд | Vercel |
| Мониторинг | UptimeRobot → GET /health каждые 5 мин |

---

## Структура репозитория

```
vs-motors/
├── CLAUDE.md          ← этот файл
├── SPEC.md
├── TODO.md
├── PROGRESS.md
├── DECISIONS.md
├── TESTING_CHECKLIST.md
├── DISASTER_RECOVERY.md
├── CHANGELOG.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
└── frontend/
    ├── src/
    ├── package.json
    ├── vite.config.ts
    └── ...
```

---

## Критические решения (обязательно соблюдать)

Полный список с обоснованием — в `DECISIONS.md`. Краткая выжимка:

1. **asyncpg**: всегда `statement_cache_size=0` — Supabase Pooler иначе падает (параметр именно так называется, не `prepared_statement_cache_size`)
2. **Авторизация**: владелец = `telegram_id == OWNER_TELEGRAM_ID` из ENV. Обычные пользователи не авторизуются вообще
3. **Фото**: библиотека `filetype==1.2.0` для валидации (не `python-magic` — нет libmagic на Render)
4. **Шаринг**: `navigator.clipboard.writeText(url)` — URL строить синхронно, без await перед writeText
5. **Статусы объявлений**: `active` и `sold`. Физическое удаление — только явное действие владельца
6. **Фильтров нет** — это витрина, не каталог. GET /api/listings принимает только `page` и `page_size`

---

## ENV переменные

### Бэкенд (Render)
```
DATABASE_URL=          # PostgreSQL connection string Supabase
BOT_TOKEN=             # от @BotFather
BOT_USERNAME=          # username бота без @
OWNER_TELEGRAM_ID=     # твой Telegram ID (число)
CLOUDINARY_URL=        # cloudinary://key:secret@cloud
MINI_APP_URL=          # https://vsmotors.vercel.app
CORS_ORIGINS=          # список через запятую
```

### Фронтенд (Vercel)
```
VITE_API_URL=          # https://vs-motors-api.onrender.com
VITE_BOT_USERNAME=     # username бота
VITE_OWNER_TG_USERNAME= # твой TG username (для кнопки «Написать»)
VITE_OWNER_WHATSAPP=   # номер без + (для кнопки WhatsApp)
VITE_OWNER_PHONE=      # номер с + (для кнопки звонка)
VITE_CURRENCY=         # USD или ILS
```

---

## Страницы приложения

| Маршрут | Страница | Доступ |
|---|---|---|
| `/` | HomePage — витрина | Все |
| `/listing/:id` | ListingDetailPage — детали авто | Все |
| `/add` | AddListingPage — добавить | Только владелец |
| `/listing/:id/edit` | EditListingPage — редактировать | Только владелец |
| `/admin` | AdminPage — управление | Только владелец |

---

## Как продолжать работу в новом чате

1. Открой терминал в папке `vs-motors/`
2. Запусти `claude`
3. Скажи: **«Прочитай CLAUDE.md, PROGRESS.md и продолжай с текущего этапа»**
4. Claude Code прочитает контекст и продолжит с того места где остановились

---

## Правило обновления этого файла

После каждого завершённого этапа или важного решения:
- Обновить секцию **«Текущий статус»** выше
- Обновить `PROGRESS.md`
- Добавить запись в `CHANGELOG.md`

---

*Последнее обновление: май 2026*
