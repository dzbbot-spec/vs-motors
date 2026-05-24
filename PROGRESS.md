# PROGRESS — VS MOTORS

Последнее обновление: май 2026

## Статус: ✅ Готово к деплою

| Компонент | Статус |
|---|---|
| Backend (FastAPI + aiogram 3) | ✅ Готово |
| База данных (migration.sql) | ✅ Готово |
| API публичный | ✅ Готово |
| API owner (CRUD + Cloudinary) | ✅ Готово |
| Авторизация initData + HMAC | ✅ Готово |
| Telegram бот | ✅ Готово |
| Frontend скелет (Vite + React + TS) | ✅ Готово |
| HomePage | ✅ Готово |
| ListingDetailPage | ✅ Готово |
| AddListingPage | ✅ Готово |
| EditListingPage | ✅ Готово |
| AdminPage | ✅ Готово |
| Deep links (startapp=listing_id) | ✅ Готово |
| Сборка без ошибок | ✅ Готово |

## Деплой
- Backend → Render (auto-deploy с GitHub, ветка main)
- Frontend → Vercel (auto-deploy с GitHub, ветка main)
- БД → Supabase (выполнить migration.sql вручную)
- Фото → Cloudinary (папка vs-motors)

## Известные особенности
- Фото при создании объявления добавляются через страницу редактирования
  (листинг должен существовать для получения подписи Cloudinary)
- Диагностика: `{"status":"ok","db":"ok"}` — GET /health

## Исправленные баги (из предыдущей версии)
- `signature` в initData excludes из data_check_string (Bot API 7.3)
- asyncpg: `statement_cache_size=0` (не `prepared_statement_cache_size`)
- lib/telegram.ts: lazy `tg()` функция, не модульная константа
- useTelegram: `useState + useEffect` для задержки инъекции данных TG
- hasNext: инициализируется `false` (не `true`)
