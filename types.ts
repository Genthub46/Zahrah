
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: 'Abayas' | 'Premium Fabrics' | 'Accessories';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StyleAdvice {
  advice: string;
  suggestedColors: string[];
}
