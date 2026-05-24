-- Миграция 001: создание таблицы listings
-- Применять в Supabase: SQL Editor → New query → вставить → Run

CREATE TABLE IF NOT EXISTS listings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Основное
    brand       TEXT NOT NULL,
    model       TEXT NOT NULL,
    year        INTEGER NOT NULL,
    price       INTEGER NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'USD',
    status      TEXT NOT NULL DEFAULT 'active', -- active | sold

    -- Характеристики
    mileage         INTEGER,
    transmission    TEXT,   -- AUTO | MANUAL | CVT | ROBOT
    fuel_type       TEXT,   -- PETROL | DIESEL | HYBRID | ELECTRIC | GAS
    body_type       TEXT,   -- SEDAN | HATCHBACK | SUV | MINIVAN | COUPE | WAGON | CONVERTIBLE | PICKUP
    color           TEXT,
    engine_volume   NUMERIC(3,1),
    power_hp        INTEGER,
    drive_type      TEXT,   -- FWD | RWD | AWD
    vin             TEXT,
    country         TEXT,

    -- Контент
    description TEXT,
    photos      TEXT[] NOT NULL DEFAULT '{}'
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_listings_status     ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
