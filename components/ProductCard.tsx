
import React, { useEffect, useRef, useState } from 'react';
import { Product } from '../types';
import { Plus, Share2, Check, Tag, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onLogView?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onLogView }) => {
  const viewedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const isSoldOut = product.stock <= 0;

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#/product/${product.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToProduct = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`group relative cursor-pointer ${isSoldOut ? 'opacity-80' : ''}`} 
      id={`product-${product.id}`} 
      onClick={goToProduct}
    >
      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-stone-100 relative shadow-sm transition-shadow hover:shadow-2xl hover:shadow-stone-200">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-all duration-1000 ${!isSoldOut ? 'group-hover:scale-110' : 'grayscale contrast-75'}`}
        />
        
        {/* Brand Label Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-[8px] font-bold tracking-[0.2em] uppercase border border-stone-200 shadow-sm">
            {product.brand}
          </span>
        </div>

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-stone-900 text-white px-3 py-1.5 text-[8px] font-bold tracking-[0.2em] uppercase shadow-xl flex items-center space-x-1">
              <Ban size={10} className="mr-1" />
              SOLD OUT
            </span>
          </div>
        )}

        {/* Share Button Overlay */}
        {!isSoldOut && (
          <button 
            onClick={handleShare}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} className="text-stone-900" />}
          </button>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100">
          {isSoldOut ? (
            <div className="bg-stone-900/50 backdrop-blur-sm text-white px-8 py-3 text-[10px] font-bold tracking-[0.3em] uppercase border border-white/20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              NOT IN STOCK
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-white text-stone-900 px-8 py-3 text-xs font-bold tracking-widest hover:bg-stone-900 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl"
            >
              ADD TO BAG
            </button>
          )}
        </div>
      </div>
      <div className="mt-5 flex justify-between items-start">
        <div>
          <h3 className={`text-sm font-medium tracking-wide transition-colors duration-300 ${isSoldOut ? 'text-stone-400' : 'text-stone-900 group-hover:gold-text'}`}>
            {product.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1.5">
            <p className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold">{product.category}</p>
            {isSoldOut && (
              <span className="text-red-400 text-[8px] font-bold uppercase tracking-tighter ml-2">• OUT OF STOCK</span>
            )}
          </div>
        </div>
        <p className={`text-sm font-semibold ${isSoldOut ? 'text-stone-300 line-through' : 'text-stone-900'}`}>
          N{product.price.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
