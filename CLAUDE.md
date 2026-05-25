# VS MOTORS — контекст проекта

## Что это
Telegram Mini App для личного автосалона. Владелец — Денис (@D232216756, user_id: 1914219730).

## Стек
- **Backend:** FastAPI + aiogram 3 → Render (auto-deploy с GitHub `main`)
- **Frontend:** Vite + React + TypeScript → Vercel (auto-deploy с GitHub `main`)
- **БД:** Supabase (PostgreSQL)
- **Фото:** Cloudinary (cloud: `dfbhw1rfx`, папка `vs-motors`)

## Архитектура API-запросов
```
iOS Telegram → Vercel (same-origin) → Render (server-side proxy)
```
- Vercel rewrite: `/api/*` и `/health` → `https://vs-motors-7ssq.onrender.com/...`
- `VITE_API_URL` не задан — `BASE_URL = ''` (same-origin)
- Все запросы через `src/api/client.ts` (XMLHttpRequest, не fetch!)

## Критические ограничения iOS Telegram WebView
1. **`fetch()` POST зависает** → использовать только `XMLHttpRequest` (`api/client.ts`)
2. **`alert()` заблокирован** → ошибки через React state (`setError()`)
3. **Cross-origin запросы заблокированы** → Vercel proxy обязателен

## DB CHECK constraints
Поля в таблице `listings` принимают только английские коды:
- `transmission`: `AUTO`, `MANUAL`, `CVT`, `ROBOT`
- `fuel_type`: `PETROL`, `DIESEL`, `HYBRID`, `ELECTRIC`, `GAS`
- `body_type`: `SEDAN`, `HATCHBACK`, `SUV`, `MINIVAN`, `COUPE`, `WAGON`, `CONVERTIBLE`, `PICKUP`
- `drive_type`: `FWD`, `RWD`, `AWD`
- `status`: `active`, `sold`

В форме: `<option value="AUTO">Автомат</option>` (value = код, текст = русский).
В ListingDetailPage: словари `TRANSMISSION`, `FUEL`, `BODY`, `DRIVE` для обратного маппинга.

## Авторизация
- `X-Telegram-Init-Data` заголовок → HMAC верификация в `backend/auth.py`
- `DEBUG_SKIP_AUTH=true` на Render — обход HMAC для тестирования (owner ID всё равно проверяется)

## CORS (backend/main.py)
```python
allow_credentials=False
allow_headers=["Content-Type", "X-Telegram-Init-Data"]
```
`allow_credentials=True` + `allow_headers=["*"]` — невалидная комбинация, не использовать.

## UI / Дизайн
- Никаких эмодзи в интерфейсе
- Никаких внешних UI-библиотек
- CSS-переменные из `theme.css`: `--bg`, `--bg-secondary`, `--text`, `--hint`, `--button`, `--button-text`, `--divider`, `--danger`, `--radius`, `--radius-sm`
- `theme.css` импортируется перед `index.css` в `main.tsx`
- CarCard поддерживает `layout="vertical"` и `layout="horizontal"`
- localStorage ключ `vs_layout` хранит выбор вида (list/grid) на HomePage

## Стиль кода
- Комментарии на русском
- Без лишних абстракций
- Ключи только в `.env`
- Прогресс в `PROGRESS.md`
