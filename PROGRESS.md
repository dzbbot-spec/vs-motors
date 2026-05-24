# PROGRESS — VS MOTORS

Текущий статус разработки. Обновляется после каждого этапа.

---

## Общий статус

| Компонент | Статус | Примечания |
|---|---|---|
| Инфраструктура | ✅ Готово | |
| База данных | ✅ Готово | |
| API (публичный) | ✅ Готово | |
| API (owner) | ✅ Готово | |
| Telegram бот | ✅ Готово | |
| Фронтенд — скелет | ✅ Готово | |
| HomePage | ✅ Готово | |
| ListingDetailPage | ✅ Готово | |
| AddListingPage | ✅ Готово | |
| AdminPage | ✅ Готово | |
| Deep links | ✅ Готово | |
| Продакшн | ⏳ Не начато | |

**Статусы:** ✅ Готово | 🔄 В работе | ⏳ Не начато | ❌ Заблокировано

---

## Этапы

### Этап 0 — Инфраструктура
**Статус:** ✅ Готово

- [x] Telegram бот создан (vs_motors_showroom_bot)
- [x] Supabase проект создан
- [x] Cloudinary аккаунт настроен (dfbhw1rfx)
- [x] Render + Vercel аккаунты
- [x] UptimeRobot настроен
- [x] GitHub репозиторий создан (dzbbot-spec/vs-motors, приватный)
- [x] Бэкенд инициализирован (FastAPI + aiogram 3 + asyncpg + Dockerfile)
- [x] Фронтенд инициализирован (Vite + React 18 + TS + react-router-dom + @twa-dev/sdk)
- [x] Скелет задеплоен
- [x] `/health` работает
- [x] Все ENV заданы

---

### Этап 1 — База данных
**Статус:** ✅ Готово

- [x] Таблица `listings` создана (migrations/001_create_listings.sql)
- [x] Индексы добавлены (status, created_at DESC)
- [x] Тестовые данные добавлены
- [x] asyncpg подключается без ошибок (statement_cache_size=0)

---

### Этап 2 — API публичный
**Статус:** ✅ Готово

- [x] GET /api/listings (пагинация)
- [x] GET /api/listings/{id}
- [x] CORS настроен

---

### Этап 3 — Авторизация владельца
**Статус:** ✅ Готово

- [x] Верификация initData (HMAC-SHA256)
- [x] Сравнение с OWNER_TELEGRAM_ID
- [x] 403 для не-владельца

---

### Этап 4 — API owner
**Статус:** ✅ Готово

- [x] POST /api/listings
- [x] PATCH /api/listings/{id}
- [x] DELETE /api/listings/{id}
- [x] GET /api/admin/listings
- [x] Cloudinary signed upload
- [x] Удаление фото

---

### Этап 5 — Telegram бот
**Статус:** ✅ Готово

- [x] /start с кнопкой Mini App
- [x] /help
- [x] startapp deep link обрабатывается
- [x] Menu Button настраивается при старте сервера

---

### Этап 6 — Фронтенд скелет
**Статус:** ✅ Готово

- [x] @twa-dev/sdk подключён
- [x] Тема Telegram применена (CSS variables)
- [x] Роутинг настроен
- [x] Owner guard реализован

---

### Этап 7 — HomePage
**Статус:** ✅ Готово

- [x] CarCard компонент
- [x] Бесконечная прокрутка (IntersectionObserver)
- [x] Skeleton загрузка
- [x] Пустое состояние
- [x] Кнопка «Добавить» (только owner)

---

### Этап 8 — ListingDetailPage
**Статус:** ✅ Готово

- [x] Галерея (свайп, точки, счётчик)
- [x] Таблица характеристик
- [x] Блок контактов (TG + WA + телефон)
- [x] Кнопка «Поделиться» + toast
- [x] Owner-кнопки (редактировать / удалить)

---

### Этап 9 — AddListingPage / EditListingPage
**Статус:** ✅ Готово

- [x] 4-шаговая форма
- [x] Загрузка фото (Cloudinary signed upload)
- [x] Редактирование с предзаполнением
- [x] Защита маршрута (OwnerGuard)

---

### Этап 10 — AdminPage
**Статус:** ✅ Готово

- [x] Список всех объявлений
- [x] Быстрая смена статуса
- [x] Удаление с подтверждением

---

### Этап 11 — Deep links
**Статус:** ✅ Готово

- [x] start_param обрабатывается (DeepLinkHandler в App.tsx)
- [x] Кнопка «Поделиться» строит корректный deep link

---

### Этап 12 — Продакшн
**Статус:** ⏳ Не начато

- [ ] Все ENV в продакшне
- [ ] TESTING_CHECKLIST пройден
- [ ] Тест на реальных устройствах
- [ ] Автодеплой настроен

---

## Известные проблемы

*Пока нет.*

---

## Принятые решения (кратко)

| Решение | Дата | Файл |
|---|---|---|
| Один владелец без JWT | май 2026 | DECISIONS.md |
| Пользователи не авторизуются | май 2026 | DECISIONS.md |
| Один процесс FastAPI + бот | май 2026 | DECISIONS.md |
| Cloudinary signed upload | май 2026 | DECISIONS.md |
| filetype вместо python-magic | май 2026 | DECISIONS.md |
| Фото как TEXT[] в PostgreSQL | май 2026 | DECISIONS.md |

---

*Последнее обновление: май 2026*
