
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ash-6',
    name: 'Ashluxe Street Graffiti Cap Black',
    brand: 'ASHLUXE',
    price: 190000,
    images: ['https://i.ibb.co/zH8Xy6S/cap-black.png'],
    description: 'The Ashluxe Street Graffiti Cap delivers a bold interpretation of luxury streetwear. Designed with a structured crown and distinctive graphic detailing, this cap completes modern outfits with an elevated edge.',
    category: 'Accessories',
    stock: 20,
    tags: ['new', 'arrivals', 'headwear'],
    colors: [{ name: 'Black', hex: '#000000' }],
    sizes: ['OS'],
    features: [
      'Structured six-panel design',
      'Premium fabric construction',
      'Signature Ashluxe graffiti graphic',
      'Designed for luxury streetwear styling'
    ],
    composition: [
      '100% Premium Cotton Twill',
      'High-density embroidery'
    ],
    specifications: [
      'Adjustable strap-back',
      'Breathable eyelets',
      'Reinforced brim'
    ]
  },
  {
    id: 'ash-1',
    name: 'Ashluxe Pixel Denim Jacket Green',
    brand: 'ASHLUXE',
    price: 288800,
    images: ['https://i.ibb.co/LdY7pM7/jacket-green.png'],
    description: 'High-density pixelated denim jacket with signature hardware. A refined piece curated for clients who shop premium fashion.',
    category: 'Apparel',
    stock: 5,
    tags: ['bundle', 'new', 'streetwear', 'green'],
    colors: [{ name: 'Green', hex: '#2D5A27' }, { name: 'Black', hex: '#000000' }],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Pixelated denim weave', 'Branded hardware', 'Relaxed fit'],
    composition: ['100% Rigid Denim'],
    specifications: ['Dry clean only']
  },
  {
    id: 'ash-5',
    name: 'Ashluxe Ngn X Bra T-Shirt',
    brand: 'ASHLUXE',
    price: 304000,
    images: ['https://i.ibb.co/vYm6sJ3/tee-black.png'],
    description: 'Artistic collage graphic tee on premium heavy cotton.',
    category: 'Apparel',
    stock: 10,
    tags: ['new', 'arrivals'],
    colors: [{ name: 'Black', hex: '#000000' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    features: ['Heavyweight cotton', 'High-res print'],
    composition: ['100% Organic Cotton']
  }
];

export const APP_STORAGE_KEY = 'ZARHRAH_LUXURY_V1';
export const WISHLIST_STORAGE_KEY = 'ZARHRAH_WISHLIST';
export const PRODUCTS_STORAGE_KEY = 'ZARHRAH_PRODUCTS';
export const ORDERS_STORAGE_KEY = 'ZARHRAH_ORDERS';
export const REVIEWS_STORAGE_KEY = 'ZARHRAH_REVIEWS';
export const RESTOCK_REQUESTS_STORAGE_KEY = 'ZARHRAH_RESTOCK_REQUESTS';
export const ANALYTICS_STORAGE_KEY = 'ZARHRAH_VIEW_LOGS';
