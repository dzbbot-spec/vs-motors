# Disaster Recovery — VS MOTORS

*Последнее обновление: май 2026*
*Ответственный: владелец*

---

## Мониторинг

- **UptimeRobot** — пингует `/health` каждые 5 минут, алерт на email + Telegram при даунтайме
- **Render Dashboard** — логи сервиса в реальном времени (https://dashboard.render.com)
- **Supabase Dashboard** — состояние БД (https://supabase.com/dashboard)
- **Cloudinary Dashboard** — использование кредитов (https://cloudinary.com/console)

---

## Сценарий 1: Render не отвечает (бэкенд лежит)

**Симптомы:** UptimeRobot присылает алерт, Mini App не загружает объявления, бот не отвечает.

**Действия:**
1. Зайти в Render Dashboard → найти сервис VS MOTORS API
2. Проверить логи — найти причину сбоя
3. Нажать **Manual Deploy** → **Restart service**
4. Если не помогает → **Rollback** на предыдущий деплой (кнопка в истории деплоев)
5. Проверить `/health` после восстановления: `{"status": "ok", "db": "ok"}`

**Время восстановления:** обычно 2–5 минут.

**Важно:** Render Free tier засыпает через 15 минут без запросов. UptimeRobot должен пинговать каждые 5 минут — проверить что мониторинг активен.

---

## Сценарий 2: Supabase недоступен

**Симптомы:** `/health` возвращает `{"status": "ok", "db": "error"}`, объявления не загружаются.

**Действия:**
1. Проверить статус: https://status.supabase.com
2. Подождать — обычно инциденты Supabase решаются за 1–2 часа
3. После восстановления — проверить `/health`, убедиться что объявления загружаются

**Важно:** Supabase Free tier делает ежедневные снэпшоты. При потере данных — обратиться в поддержку Supabase.

---

## Сценарий 3: Cloudinary заблокировал аккаунт или превышен лимит

**Симптомы:** загрузка фото не работает, ошибка 400/403 от Cloudinary при попытке добавить фото к объявлению.

**Причина скорее всего:** превышение лимита 25 кредитов (Cloudinary Free tier).

**Действия:**
1. Проверить Cloudinary Dashboard → текущее использование
2. Если лимит превышен — перейти на Cloudinary Plus ($89/мес) или зарегистрировать новый Free аккаунт
3. При новом аккаунте — обновить `CLOUDINARY_URL` в Render Environment Variables → редеплоить
4. Уже загруженные фото из старого аккаунта **останутся доступными** по существующим URL — это нормально

**Профилактика:** следить за дашбордом Cloudinary раз в месяц.

---

## Сценарий 4: Скомпрометированы секреты

**Симптомы:** подозрительные запросы в логах, неожиданные объявления в приложении.

**Действия:**
1. Немедленно ротировать скомпрометированные ключи в Render Environment Variables:
   - `BOT_TOKEN` — новый от @BotFather (команда `/revoke`)
   - `CLOUDINARY_URL` — ротировать API Key в Cloudinary Dashboard
   - `DATABASE_URL` — сменить пароль в Supabase → Settings → Database
2. После смены каждого ключа — редеплоить Render сервис
3. Проверить логи на предмет несанкционированных действий (создание/удаление объявлений)

---

## Сценарий 5: Критическая ошибка после деплоя

**Симптомы:** сразу после деплоя Mini App перестало работать, ошибки в логах.

**Действия:**
1. Render Dashboard → Deploy History → нажать **Rollback** на предыдущий рабочий деплой
2. Время восстановления: 2–3 минуты
3. Исправить ошибку в коде, протестировать локально, задеплоить заново

---

## Сценарий 6: Vercel фронтенд недоступен

**Симптомы:** ссылка на Mini App открывает пустую страницу или ошибку.

**Действия:**
1. Проверить статус Vercel: https://www.vercel-status.com
2. Зайти в Vercel Dashboard → найти деплой → проверить логи сборки
3. При ошибке сборки — исправить, запушить в main
4. При системном сбое Vercel — подождать, обычно решается за 30 минут

---

## Сценарий 7: Бот перестал отвечать

**Симптомы:** команды /start и /help не работают, бот молчит.

**Причины и действия:**
- **Render сервис упал** → см. Сценарий 1
- **BOT_TOKEN невалиден** → проверить в @BotFather, обновить в Render ENV
- **Webhook слетел** → переустановить webhook:
  ```
  curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
    -d url={API_URL}/webhook
  ```
- **Telegram API недоступен** → проверить https://downdetector.com/status/telegram, подождать

---

## Быстрые ссылки

| Сервис | Статус | Дашборд |
|---|---|---|
| Supabase | status.supabase.com | supabase.com/dashboard |
| Render | status.render.com | dashboard.render.com |
| Vercel | vercel-status.com | vercel.com/dashboard |
| Cloudinary | — | cloudinary.com/console |
| UptimeRobot | — | uptimerobot.com/dashboard |

---

## Контакты для экстренной связи

| Сервис | Поддержка |
|---|---|
| Supabase | supabase.com/support |
| Render | render.com/support |
| Cloudinary | cloudinary.com/contact |
| Telegram (бот) | @BotSupport |

---

*При любом инциденте: сначала проверить логи Render → потом статусы сервисов → потом контактировать поддержку.*
