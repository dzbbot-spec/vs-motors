export interface Listing {
  id: string
  created_at: string
  brand: string
  model: string
  year: number
  price: number
  currency: string
  mileage: number | null
  transmission: string | null
  fuel_type: string | null
  status: 'active' | 'sold'
  photos: string[]
}

export interface ListingFull extends Listing {
  updated_at: string
  body_type: string | null
  color: string | null
  engine_volume: number | null
  power_hp: number | null
  drive_type: string | null
  vin: string | null
  country: string | null
  description: string | null
}

export interface ListingsPage {
  items: Listing[]
  total: number
  page: number
  page_size: number
  has_next: boolean
}
