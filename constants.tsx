
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'a-1',
    name: 'Zara Timescape Resort Shirt',
    brand: 'ZARA UK',
    price: 35000,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
    description: 'White resort shirt with yellow fruit print.',
    category: 'Apparel',
    stock: 12,
    tags: ['clothes', 'summer', 'printed', 'resort']
  },
  {
    id: 'a-2',
    name: 'Denver 1991 Striped Polo',
    brand: 'ZARA MAN',
    price: 28000,
    images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80'],
    description: 'Classic green and white striped polo.',
    category: 'Apparel',
    stock: 8,
    tags: ['polo', 'clothes', 'vintage', 'green']
  },
  {
    id: 'f-1',
    name: 'Suede Penny Loafers',
    brand: 'ZARA ORIGINS',
    price: 75000,
    images: ['https://images.unsplash.com/photo-1614252329473-4881d322417d?auto=format&fit=crop&w=800&q=80'],
    description: 'Handcrafted tobacco suede loafers.',
    category: 'Footwear',
    stock: 5,
    tags: ['shoes', 'luxury', 'suede', 'tobacco']
  },
  {
    id: 'acc-1',
    name: 'Heritage Chronograph Watch',
    brand: 'ZARA ACCESSORIES',
    price: 185000,
    images: ['https://images.unsplash.com/photo-1524592091214-8c97afad3d3a?auto=format&fit=crop&w=800&q=80'],
    description: 'Minimalist silver-tone timepiece.',
    category: 'Watches',
    stock: 3,
    tags: ['timepiece', 'luxury', 'silver', 'watches']
  }
];

export const APP_STORAGE_KEY = 'ZARHRAH_LUXURY_V1';
export const PRODUCTS_STORAGE_KEY = 'ZARHRAH_PRODUCTS';
export const ORDERS_STORAGE_KEY = 'ZARHRAH_ORDERS';
export const REVIEWS_STORAGE_KEY = 'ZARHRAH_REVIEWS';
export const RESTOCK_REQUESTS_STORAGE_KEY = 'ZARHRAH_RESTOCK_REQUESTS';
export const ANALYTICS_STORAGE_KEY = 'ZARHRAH_VIEW_LOGS';
