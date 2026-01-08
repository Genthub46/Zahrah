
import React from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WishlistProps {
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ wishlist, onToggleWishlist, onAddToCart }) => {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center space-x-4 mb-4">
             <Heart className="text-red-500 fill-red-500" size={24} />
             <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">My Private Sourcing</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-stone-900 serif italic">Wishlist</h1>
          <p className="text-stone-500 mt-4 max-w-2xl font-light serif italic">A curated selection of your most coveted pieces. Reserve them before they disappear from the boutique.</p>
        </header>

        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-20 text-center border border-stone-200 rounded-[2.5rem] shadow-sm"
          >
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="text-stone-200" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-4 tracking-tight">Your wishlist is currently empty.</h2>
            <p className="text-stone-400 text-sm mb-12 max-w-md mx-auto">Discover our latest collections from ZARA UK and ASHLUXE to start your personal archive.</p>
            <Link 
              to="/" 
              className="inline-flex items-center space-x-4 bg-stone-900 text-white px-10 py-5 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-stone-800 transition-all rounded-sm shadow-xl"
            >
              <span>Explore Boutique</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
            {wishlist.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={true}
              />
            ))}
          </div>
        )}

        {wishlist.length > 0 && (
          <div className="mt-24 pt-12 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-stone-900 rounded-2xl text-white">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Ready to acquire?</p>
                <p className="text-stone-400 text-xs mt-1">Add items from your wishlist to your bag for checkout.</p>
              </div>
            </div>
            <Link 
              to="/checkout" 
              className="bg-stone-900 text-white px-12 py-5 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-stone-800 transition-all shadow-2xl rounded-sm"
            >
              Go to Bag
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;