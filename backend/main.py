import asyncio
from contextlib import asynccontextmanager

from aiogram.types import Update
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

import database
from bot import bot, dp, setup_bot_commands
from config import settings
from routers.public import router as public_router
from routers.owner import router as owner_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.pool = await database.create_pool()
    await setup_bot_commands()

    if settings.WEBHOOK_URL:
        await bot.set_webhook(url=settings.WEBHOOK_URL, drop_pending_updates=True)
    else:
        # локальная разработка — polling
        await bot.delete_webhook(drop_pending_updates=True)
        asyncio.create_task(dp.start_polling(bot))

    yield

    await bot.delete_webhook()
    await bot.session.close()
    await database.pool.close()


app = FastAPI(title="VS MOTORS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Telegram-Init-Data"],
)

app.include_router(public_router)
app.include_router(owner_router)


@app.post("/webhook")
async def telegram_webhook(request: Request):
    data = await request.json()
    update = Update.model_validate(data)
    await dp.feed_update(bot, update)
    return Response()



@app.get("/health")
async def health():
    db_ok, db_err = await database.check_db()
    return {
        "status": "ok",
        "db": "ok" if db_ok else "error",
        "db_detail": db_err,
        "pool": database.pool is not None,
        "webhook": bool(settings.WEBHOOK_URL),
        "debug_skip_auth": settings.DEBUG_SKIP_AUTH,
        "bot_token_prefix": settings.BOT_TOKEN[:10],
    }
