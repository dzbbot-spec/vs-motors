export interface FormData {
  // Шаг 1
  brand: string
  model: string
  year: string
  price: string
  currency: 'USD' | 'ILS'
  status: 'active' | 'sold'
  // Шаг 2
  mileage: string
  transmission: string
  fuel_type: string
  body_type: string
  color: string
  engine_volume: string
  power_hp: string
  drive_type: string
  vin: string
  country: string
  // Шаг 3
  description: string
  existingPhotos: string[]   // уже загруженные URL (при редактировании)
  newPhotoFiles: File[]      // новые файлы для загрузки
}

export const EMPTY_FORM: FormData = {
  brand: '', model: '', year: '', price: '',
  currency: 'USD', status: 'active',
  mileage: '', transmission: '', fuel_type: '', body_type: '',
  color: '', engine_volume: '', power_hp: '', drive_type: '',
  vin: '', country: '', description: '',
  existingPhotos: [], newPhotoFiles: [],
}
