from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel


class ListingShort(BaseModel):
    id: UUID
    created_at: datetime
    brand: str
    model: str
    year: int
    price: int
    currency: str
    mileage: int | None
    transmission: str | None
    fuel_type: str | None
    status: str
    photos: list[str]
    views: int = 0


class ListingFull(ListingShort):
    updated_at: datetime
    body_type: str | None
    color: str | None
    engine_volume: Decimal | None
    power_hp: int | None
    drive_type: str | None
    vin: str | None
    country: str | None
    description: str | None
    owners_count: int | None = None
    has_accidents: bool | None = None
    pts_original: bool | None = None
    service_history: bool | None = None
    customs_cleared: bool | None = None


class ListingsPage(BaseModel):
    items: list[ListingShort]
    total: int
    page: int
    page_size: int
    has_next: bool
