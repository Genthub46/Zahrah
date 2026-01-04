
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: 'Apparel' | 'Footwear' | 'Accessories' | 'Beauty' | 'Travel';
  stock: number;
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

export interface ViewLog {
  productId: string;
  timestamp: number;
}

export interface StyleAdvice {
  advice: string;
  suggestedColors: string[];
}
