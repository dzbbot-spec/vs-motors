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


@app.post("/debug/verify")
async def debug_verify(request: Request):
    """Временный эндпоинт для диагностики initData. Удалить после фикса."""
    import hmac as _hmac, hashlib as _hl
    from urllib.parse import parse_qsl as _pqs
    body = await request.json()
    init_data: str = body.get("init_data", "")
    try:
        params = dict(_pqs(init_data, strict_parsing=False))
        received_hash = params.pop("hash", None)
        params.pop("signature", None)
        data_check = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
        secret = _hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), _hl.sha256).digest()
        computed = _hmac.new(secret, data_check.encode(), _hl.sha256).hexdigest()
        return {
            "match": computed == received_hash,
            "received_hash": received_hash,
            "computed_hash": computed,
            "params_keys": list(params.keys()),
            "bot_token_first10": settings.BOT_TOKEN[:10],
            "data_check_snippet": data_check[:200],
        }
    except Exception as e:
        return {"error": str(e), "init_data_len": len(init_data)}


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
