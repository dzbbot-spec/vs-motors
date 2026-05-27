export interface CarModel {
  name: string
  years: [number, number]
  engines: number[]
  power: [number, number]
  fuel: string[]
  transmission: string[]
}

export interface CarBrand {
  name: string
  models: CarModel[]
}

export const CAR_DATABASE: CarBrand[] = [
  {
    name: 'Toyota',
    models: [
      { name: 'Camry', years: [1990, 2025], engines: [2.0, 2.5, 3.0, 3.5], power: [130, 310], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT', 'MANUAL'] },
      { name: 'Corolla', years: [1990, 2025], engines: [1.4, 1.6, 1.8, 2.0], power: [90, 180], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT', 'MANUAL'] },
      { name: 'RAV4', years: [1994, 2025], engines: [2.0, 2.5], power: [150, 302], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT'] },
      { name: 'Land Cruiser', years: [1990, 2025], engines: [3.0, 4.0, 4.5, 4.7], power: [170, 415], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Prius', years: [1997, 2025], engines: [1.8, 2.0], power: [98, 196], fuel: ['HYBRID'], transmission: ['CVT'] },
      { name: 'Highlander', years: [2000, 2025], engines: [2.7, 3.5], power: [185, 295], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO'] },
    ]
  },
  {
    name: 'BMW',
    models: [
      { name: '3 Series', years: [1990, 2025], engines: [1.5, 2.0, 2.5, 3.0], power: [116, 374], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: '5 Series', years: [1990, 2025], engines: [2.0, 2.5, 3.0, 4.4], power: [150, 530], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'X5', years: [1999, 2025], engines: [2.0, 3.0, 4.4], power: [190, 530], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'X3', years: [2003, 2025], engines: [2.0, 3.0], power: [150, 390], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: '7 Series', years: [1990, 2025], engines: [2.0, 3.0, 4.4, 6.6], power: [258, 625], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'X6', years: [2008, 2025], engines: [3.0, 4.4], power: [245, 530], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO'] },
    ]
  },
  {
    name: 'Mercedes-Benz',
    models: [
      { name: 'C-Class', years: [1990, 2025], engines: [1.5, 2.0, 3.0, 4.0], power: [129, 510], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'E-Class', years: [1990, 2025], engines: [2.0, 3.0, 3.5, 4.0], power: [143, 612], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'GLE', years: [1997, 2025], engines: [2.0, 3.0, 4.0], power: [190, 612], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'S-Class', years: [1990, 2025], engines: [3.0, 4.0, 6.0], power: [286, 630], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'GLC', years: [2015, 2025], engines: [2.0], power: [170, 476], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'A-Class', years: [1997, 2025], engines: [1.3, 1.5, 2.0], power: [102, 421], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
    ]
  },
  {
    name: 'Volkswagen',
    models: [
      { name: 'Passat', years: [1990, 2025], engines: [1.4, 1.8, 2.0, 2.5, 3.6], power: [105, 280], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Golf', years: [1990, 2025], engines: [1.0, 1.4, 1.6, 2.0], power: [85, 320], fuel: ['PETROL', 'DIESEL', 'HYBRID', 'GAS'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Tiguan', years: [2007, 2025], engines: [1.4, 2.0], power: [122, 320], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Touareg', years: [2002, 2025], engines: [2.0, 3.0, 4.0], power: [231, 421], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'Polo', years: [1990, 2025], engines: [1.0, 1.2, 1.4, 1.6], power: [60, 200], fuel: ['PETROL', 'DIESEL', 'GAS'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
    ]
  },
  {
    name: 'Audi',
    models: [
      { name: 'A4', years: [1994, 2025], engines: [1.4, 1.8, 2.0, 3.0], power: [100, 450], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'A6', years: [1994, 2025], engines: [2.0, 2.8, 3.0, 4.0], power: [150, 450], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'ROBOT'] },
      { name: 'Q5', years: [2008, 2025], engines: [2.0, 3.0], power: [163, 395], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'ROBOT'] },
      { name: 'Q7', years: [2005, 2025], engines: [2.0, 3.0, 4.2], power: [231, 450], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'A3', years: [1996, 2025], engines: [1.0, 1.4, 1.8, 2.0], power: [85, 400], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
    ]
  },
  {
    name: 'Hyundai',
    models: [
      { name: 'Tucson', years: [2004, 2025], engines: [1.6, 2.0, 2.5], power: [132, 280], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Santa Fe', years: [2000, 2025], engines: [2.0, 2.2, 2.5, 3.5], power: [150, 277], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Elantra', years: [1990, 2025], engines: [1.6, 2.0], power: [128, 204], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Sonata', years: [1990, 2025], engines: [1.6, 2.0, 2.5], power: [150, 290], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO'] },
    ]
  },
  {
    name: 'Kia',
    models: [
      { name: 'Sportage', years: [1993, 2025], engines: [1.6, 2.0, 2.4, 2.7], power: [132, 265], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Sorento', years: [2002, 2025], engines: [2.2, 2.5, 3.3], power: [150, 290], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Cerato', years: [2003, 2025], engines: [1.6, 2.0], power: [122, 204], fuel: ['PETROL'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Rio', years: [2000, 2025], engines: [1.2, 1.4, 1.6], power: [84, 140], fuel: ['PETROL', 'GAS'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
    ]
  },
  {
    name: 'Nissan',
    models: [
      { name: 'X-Trail', years: [2000, 2025], engines: [1.6, 2.0, 2.5], power: [130, 211], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
      { name: 'Qashqai', years: [2006, 2025], engines: [1.2, 1.5, 1.6, 2.0], power: [115, 190], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
      { name: 'Patrol', years: [1990, 2025], engines: [3.0, 4.0, 4.8, 5.6], power: [158, 405], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Almera', years: [1995, 2020], engines: [1.4, 1.5, 1.6, 1.8], power: [85, 136], fuel: ['PETROL', 'GAS'], transmission: ['AUTO', 'MANUAL'] },
    ]
  },
  {
    name: 'Honda',
    models: [
      { name: 'Civic', years: [1990, 2025], engines: [1.0, 1.5, 1.6, 2.0], power: [100, 320], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
      { name: 'CR-V', years: [1995, 2025], engines: [1.5, 2.0, 2.4], power: [150, 272], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT'] },
      { name: 'Accord', years: [1990, 2025], engines: [1.5, 2.0, 2.4, 3.5], power: [143, 281], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
    ]
  },
  {
    name: 'Mazda',
    models: [
      { name: 'CX-5', years: [2012, 2025], engines: [2.0, 2.2, 2.5], power: [150, 230], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Mazda 6', years: [2002, 2025], engines: [1.5, 2.0, 2.5], power: [120, 194], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Mazda 3', years: [2003, 2025], engines: [1.5, 2.0, 2.5], power: [100, 186], fuel: ['PETROL'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'CX-9', years: [2006, 2025], engines: [2.5, 3.7], power: [185, 310], fuel: ['PETROL'], transmission: ['AUTO'] },
    ]
  },
  {
    name: 'Lexus',
    models: [
      { name: 'RX', years: [1997, 2025], engines: [2.0, 3.5], power: [173, 313], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT'] },
      { name: 'ES', years: [1989, 2025], engines: [2.0, 2.5, 3.5], power: [150, 302], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT'] },
      { name: 'LX', years: [1995, 2025], engines: [4.5, 5.7], power: [272, 415], fuel: ['PETROL', 'DIESEL'], transmission: ['AUTO'] },
      { name: 'NX', years: [2014, 2025], engines: [2.0, 2.5], power: [150, 306], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'CVT'] },
    ]
  },
  {
    name: 'Subaru',
    models: [
      { name: 'Outback', years: [1994, 2025], engines: [2.5, 3.6], power: [167, 260], fuel: ['PETROL'], transmission: ['AUTO', 'CVT'] },
      { name: 'Forester', years: [1997, 2025], engines: [2.0, 2.5], power: [150, 260], fuel: ['PETROL', 'HYBRID'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
      { name: 'Impreza', years: [1992, 2025], engines: [1.6, 2.0], power: [115, 268], fuel: ['PETROL'], transmission: ['AUTO', 'MANUAL', 'CVT'] },
    ]
  },
  {
    name: 'Porsche',
    models: [
      { name: 'Cayenne', years: [2002, 2025], engines: [3.0, 3.6, 4.0, 4.8], power: [250, 680], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'Macan', years: [2014, 2025], engines: [2.0, 3.0], power: [245, 440], fuel: ['PETROL', 'ELECTRIC'], transmission: ['AUTO'] },
      { name: '911', years: [1963, 2025], engines: [3.0, 3.4, 3.6, 3.8, 4.0], power: [370, 700], fuel: ['PETROL'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
    ]
  },
  {
    name: 'Land Rover',
    models: [
      { name: 'Range Rover', years: [1970, 2025], engines: [2.0, 3.0, 4.4, 5.0], power: [249, 530], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'Discovery', years: [1989, 2025], engines: [2.0, 3.0, 5.0], power: [240, 525], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO'] },
      { name: 'Defender', years: [1983, 2025], engines: [2.0, 3.0, 5.0], power: [200, 525], fuel: ['PETROL', 'DIESEL', 'HYBRID'], transmission: ['AUTO', 'MANUAL'] },
    ]
  },
  {
    name: 'Lada',
    models: [
      { name: 'Vesta', years: [2015, 2025], engines: [1.6, 1.8], power: [106, 145], fuel: ['PETROL', 'GAS'], transmission: ['AUTO', 'MANUAL', 'ROBOT'] },
      { name: 'Granta', years: [2011, 2025], engines: [1.6], power: [87, 106], fuel: ['PETROL', 'GAS'], transmission: ['AUTO', 'MANUAL'] },
      { name: 'Niva', years: [1977, 2025], engines: [1.6, 1.7, 2.0], power: [80, 123], fuel: ['PETROL', 'GAS'], transmission: ['MANUAL'] },
      { name: 'Largus', years: [2012, 2025], engines: [1.6], power: [84, 106], fuel: ['PETROL', 'GAS'], transmission: ['MANUAL'] },
    ]
  },
]
