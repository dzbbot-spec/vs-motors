-- VS MOTORS — миграция БД
-- Применить в Supabase: SQL Editor → New query → вставить → Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS listings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    brand         TEXT NOT NULL,
    model         TEXT NOT NULL,
    year          INTEGER NOT NULL,
    price         INTEGER NOT NULL,
    currency      TEXT NOT NULL DEFAULT 'USD',
    mileage       INTEGER,
    transmission  TEXT CHECK (transmission IN ('AUTO','MANUAL','CVT','ROBOT')),
    fuel_type     TEXT CHECK (fuel_type IN ('PETROL','DIESEL','HYBRID','ELECTRIC','GAS')),
    body_type     TEXT CHECK (body_type IN ('SEDAN','HATCHBACK','SUV','MINIVAN','COUPE','WAGON','CONVERTIBLE','PICKUP')),
    color         TEXT,
    engine_volume NUMERIC(4,1),
    power_hp      INTEGER,
    drive_type    TEXT CHECK (drive_type IN ('FWD','RWD','AWD')),
    vin           TEXT,
    country       TEXT,
    description   TEXT,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold')),
    photos        TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

-- Триггер auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
