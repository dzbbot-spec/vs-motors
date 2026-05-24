import asyncpg
from config import settings

pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    # statement_cache_size=0 обязательно для Supabase Pooler
    return await asyncpg.create_pool(
        settings.DATABASE_URL,
        statement_cache_size=0,
        min_size=1,
        max_size=5,
    )


async def check_db() -> bool:
    try:
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception:
        return False
