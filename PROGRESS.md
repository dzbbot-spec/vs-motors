# PROGRESS — VS MOTORS

Последнее обновление: май 2026

## Статус: ✅ Задеплоено

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
| Vercel proxy (vercel.json) | ✅ Готово |
| API клиент на XMLHttpRequest | ✅ Готово |
| Редизайн UI (минималистичный) | ✅ Готово |
| Переключатель список/плитка | ✅ Готово |
| Сборка без ошибок | ✅ Готово |

## Деплой
- Backend → Render (auto-deploy с GitHub, ветка main)
- Frontend → Vercel (auto-deploy с GitHub, ветка main)
- БД → Supabase (выполнить migration.sql вручную)
- Фото → Cloudinary (папка vs-motors)

## Известные особенности
- Фото добавляются прямо при создании объявления (шаг 4 формы) — подпись Cloudinary не требует ID листинга
- Диагностика: `{"status":"ok","db":"ok"}` — GET /health
- `DEBUG_SKIP_AUTH=true` на Render — HMAC обход для тестирования (owner ID 1914219730)

## iOS Telegram WebView — важные ограничения
- `fetch()` POST зависает без ответа → использовать `XMLHttpRequest`
- `alert()` заблокирован → показывать ошибки через React state
- Cross-origin запросы заблокированы → Vercel proxy (same-origin) обязателен
- `VITE_API_URL` должен быть пустым (или не задан) при использовании Vercel proxy

## Архитектура API-запросов
```
iOS Telegram → Vercel (same-origin) → Render (server-side proxy)
```
- Vercel `/api/*` → `https://vs-motors-7ssq.onrender.com/api/*`
- Vercel `/health` → `https://vs-motors-7ssq.onrender.com/health`
- Прогрев бэкенда: при старте приложения + при переходе на шаг 3 формы

## UI / Дизайн-система

### theme.css + index.css (редизайн май 2026)
- CSS-переменные подхватывают тему Telegram (`--tg-theme-*`) с fallback для браузера
- Все цвета через переменные: `--bg`, `--bg-secondary`, `--text`, `--hint`, `--button`, `--button-text`, `--divider`, `--danger`
- Никаких эмодзи в интерфейсе
- Никаких внешних UI-библиотек

### Компоненты
- **CarCard** — поддерживает `layout="vertical"` (плитка, фото 16:9 сверху) и `layout="horizontal"` (список, фото 38% слева)
- **PhotoGallery** — scroll-snap галерея, точки пагинации под фото
- **ListingForm** — прогресс-бар 3px вместо точек шагов
- **CardSkeleton** — адаптируется под оба layout

### HomePage — переключатель вид
- Одна кнопка SVG в шапке: показывает иконку следующего вида
- Список → горизонтальные карточки (`.home-content--list`, flex column, gap 10px)
- Плитка → вертикальные карточки 2 в ряд (`.home-content--grid`, grid 1fr 1fr, gap 10px)
- Выбор сохраняется в `localStorage` (ключ `vs_layout`, default: `list`)

## Исправленные баги
- `signature` в initData excludes из data_check_string (Bot API 7.3)
- asyncpg: `statement_cache_size=0` (не `prepared_statement_cache_size`)
- lib/telegram.ts: lazy `tg()` функция, не модульная константа
- useTelegram: `useState + useEffect` для задержки инъекции данных TG
- hasNext: инициализируется `false` (не `true`)
- CORS: `allow_credentials=True` + `allow_headers=["*"]` невалидно → `credentials=False` + explicit headers
- SELECT values: DB CHECK constraints требуют английские коды (`AUTO`, `PETROL`, `SEDAN`) — не русские метки
- fetch() → XMLHttpRequest: fetch зависал в iOS WKWebView для POST-запросов
