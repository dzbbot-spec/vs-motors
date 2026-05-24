import time
import hashlib
from uuid import UUID

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel

import database
from auth import require_owner
from config import settings
from schemas import ListingFull, ListingShort

router = APIRouter(prefix="/api", dependencies=[Depends(require_owner)])

FULL_FIELDS = """
    id, created_at, updated_at, brand, model, year, price, currency,
    mileage, transmission, fuel_type, body_type, color, engine_volume,
    power_hp, drive_type, vin, country, description, status, photos
"""


# ─── Модели запросов ──────────────────────────────────────────────────────────

class ListingCreate(BaseModel):
    brand: str
    model: str
    year: int
    price: int
    currency: str = "USD"
    status: str = "active"
    mileage: int | None = None
    transmission: str | None = None
    fuel_type: str | None = None
    body_type: str | None = None
    color: str | None = None
    engine_volume: float | None = None
    power_hp: int | None = None
    drive_type: str | None = None
    vin: str | None = None
    country: str | None = None
    description: str | None = None
    photos: list[str] = []


class ListingUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    price: int | None = None
    currency: str | None = None
    status: str | None = None
    mileage: int | None = None
    transmission: str | None = None
    fuel_type: str | None = None
    body_type: str | None = None
    color: str | None = None
    engine_volume: float | None = None
    power_hp: int | None = None
    drive_type: str | None = None
    vin: str | None = None
    country: str | None = None
    description: str | None = None
    photos: list[str] | None = None


# ─── Эндпоинты ────────────────────────────────────────────────────────────────

@router.get("/admin/listings", response_model=list[ListingShort])
async def admin_get_listings():
    """Все объявления включая sold — для AdminPage."""
    async with database.pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, created_at, brand, model, year, price, currency,
                   mileage, transmission, fuel_type, status, photos
            FROM listings ORDER BY created_at DESC
            """
        )
    return [ListingShort(**dict(r)) for r in rows]


@router.post("/listings", response_model=ListingFull, status_code=201)
async def create_listing(data: ListingCreate):
    fields = data.model_dump()
    cols = ", ".join(fields.keys())
    placeholders = ", ".join(f"${i+1}" for i in range(len(fields)))
    async with database.pool.acquire() as conn:
        row = await conn.fetchrow(
            f"INSERT INTO listings ({cols}) VALUES ({placeholders}) RETURNING {FULL_FIELDS}",
            *fields.values(),
        )
    return ListingFull(**dict(row))


@router.patch("/listings/{listing_id}", response_model=ListingFull)
async def update_listing(listing_id: UUID, data: ListingUpdate):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Нет полей для обновления")
    set_clause = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(updates))
    async with database.pool.acquire() as conn:
        row = await conn.fetchrow(
            f"UPDATE listings SET {set_clause} WHERE id = $1 RETURNING {FULL_FIELDS}",
            listing_id, *updates.values(),
        )
    if not row:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    return ListingFull(**dict(row))


@router.delete("/listings/{listing_id}", status_code=204)
async def delete_listing(listing_id: UUID):
    async with database.pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM listings WHERE id = $1", listing_id
        )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Объявление не найдено")


@router.post("/listings/{listing_id}/photos")
async def get_upload_signature(listing_id: UUID):
    """Генерирует signed upload parameters для Cloudinary."""
    _init_cloudinary()
    timestamp = int(time.time())
    folder = f"vs-motors/{listing_id}"
    params_to_sign = f"folder={folder}&timestamp={timestamp}"
    api_secret = cloudinary.config().api_secret
    signature = hashlib.sha1(
        (params_to_sign + api_secret).encode()
    ).hexdigest()
    return {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": cloudinary.config().api_key,
        "cloud_name": cloudinary.config().cloud_name,
        "folder": folder,
    }


@router.delete("/listings/{listing_id}/photos")
async def delete_photo(listing_id: UUID, url: str = Body(..., embed=True)):
    """Удаляет фото из массива photos объявления."""
    async with database.pool.acquire() as conn:
        row = await conn.fetchrow(
            "UPDATE listings SET photos = array_remove(photos, $1) "
            "WHERE id = $2 RETURNING id",
            url, listing_id,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Объявление не найдено")
    return {"ok": True}


def _init_cloudinary():
    cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
