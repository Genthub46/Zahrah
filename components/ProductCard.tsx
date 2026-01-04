
import React, { useEffect, useRef } from 'react';
import { Product } from '../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onLogView?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onLogView }) => {
  const viewedRef = useRef(false);

  // Intersection observer to log view when product is actually seen
  useEffect(() => {
    if (!onLogView) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !viewedRef.current) {
        onLogView(product.id);
        viewedRef.current = true;
      }
    }, { threshold: 0.5 });

    const el = document.getElementById(`product-${product.id}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [product.id, onLogView]);

  return (
    <div className="group relative" id={`product-${product.id}`}>
      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-stone-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onAddToCart(product)}
            className="bg-white text-stone-900 px-8 py-3 text-xs font-bold tracking-widest hover:bg-stone-900 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
          >
            ADD TO BAG
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-stone-900 tracking-wide">{product.name}</h3>
          <p className="mt-1 text-xs text-stone-500 uppercase tracking-widest">{product.category}</p>
        </div>
        <p className="text-sm font-semibold text-stone-900">N{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ProductCard;
