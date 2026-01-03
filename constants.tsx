
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Regal Blue Abaya',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'A deep blue velvet-trimmed masterpiece for royal occasions.',
    category: 'Abayas'
  },
  {
    id: '2',
    name: 'Silk & Lace Abaya',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    description: 'Intricate lace detailing meets the finest silk for effortless elegance.',
    category: 'Abayas'
  },
  {
    id: '3',
    name: 'Emerald Onyx Kaftan',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'A striking blend of emerald green and dark onyx silk.',
    category: 'Abayas'
  },
  {
    id: '4',
    name: 'Desert Sand Linen',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight, breathable linen perfect for warm evening events.',
    category: 'Abayas'
  }
];

export const APP_STORAGE_KEY = 'RHRAH_CART_V2';
