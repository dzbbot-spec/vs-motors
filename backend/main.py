from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
from bot import bot, dp
from config import settings
from routers.public import router as public_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Старт: поднимаем БД и бота
    database.pool = await database.create_pool()
    await bot.delete_webhook(drop_pending_updates=True)
    # Бот работает через polling в фоне
    import asyncio
    polling_task = asyncio.create_task(dp.start_polling(bot))
    yield
    # Стоп: корректное завершение
    polling_task.cancel()
    await dp.stop_polling()
    await bot.session.close()
    await database.pool.close()


app = FastAPI(title="VS MOTORS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router)


@app.get("/health")
async def health():
    db_ok = await database.check_db()
    return {"status": "ok", "db": "ok" if db_ok else "error"}
