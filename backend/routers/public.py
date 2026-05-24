from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
import database
from schemas import ListingFull, ListingsPage, ListingShort

router = APIRouter(prefix="/api")

SHORT = "id, created_at, brand, model, year, price, currency, mileage, transmission, fuel_type, status, photos"
FULL = SHORT + ", updated_at, body_type, color, engine_volume, power_hp, drive_type, vin, country, description"


@router.get("/listings", response_model=ListingsPage)
async def get_listings(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=50)):
    offset = (page - 1) * page_size
    async with database.pool.acquire() as conn:
        total = await conn.fetchval("SELECT COUNT(*) FROM listings WHERE status = 'active'")
        rows = await conn.fetch(
            f"SELECT {SHORT} FROM listings WHERE status = 'active' ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            page_size, offset,
        )
    return ListingsPage(
        items=[ListingShort(**dict(r)) for r in rows],
        total=total, page=page, page_size=page_size,
        has_next=(offset + page_size) < total,
    )


@router.get("/listings/{listing_id}", response_model=ListingFull)
async def get_listing(listing_id: UUID):
    async with database.pool.acquire() as conn:
        row = await conn.fetchrow(f"SELECT {FULL} FROM listings WHERE id = $1", listing_id)
    if not row:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    return ListingFull(**dict(row))
