
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  description: string;
  category: 'Apparel' | 'Footwear' | 'Accessories' | 'Beauty' | 'Travel' | 'Watches' | 'Perfumes' | 'Bags';
  stock: number;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
}

export interface RestockRequest {
  id: string;
  productId: string;
  customerEmail: string;
  date: string;
}

export interface ViewLog {
  productId: string;
  timestamp: number;
}

export interface StyleAdvice {
  advice: string;
  suggestedColors: string[];
}
