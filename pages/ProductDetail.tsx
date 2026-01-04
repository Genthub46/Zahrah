
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ArrowLeft, Share2, Check, ShoppingBag, ShieldCheck, Tag, Ban } from 'lucide-react';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLogView: (id: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart, onLogView }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const product = products.find(p => p.id === id);
  const isSoldOut = product ? product.stock <= 0 : false;

  useEffect(() => {
    if (product) {
      onLogView(product.id);
      window.scrollTo(0, 0);
    }
  }, [product, onLogView]);

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Item Not Found</h2>
        <p className="text-stone-500 mb-8">This piece may have been removed from the current collection.</p>
        <Link to="/" className="text-xs font-bold gold-text border-b border-[#C5A059] pb-2 tracking-[0.3em]">RETURN TO CATALOG</Link>
      </div>
    );
  }

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-stone-400 hover:text-stone-900 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Collection</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-sm bg-stone-50 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 ${isSoldOut ? 'grayscale contrast-75' : ''}`}
              />
              <div className="absolute top-6 left-6 flex flex-col space-y-2">
                <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-[9px] font-bold tracking-[0.3em] uppercase border border-stone-200 self-start">
                  {product.category}
                </span>
                <span className="bg-stone-900 text-white px-4 py-2 text-[9px] font-bold tracking-[0.3em] uppercase self-start">
                  {product.brand}
                </span>
              </div>
              {isSoldOut && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-stone-900 text-white px-8 py-4 text-[12px] font-bold tracking-[0.5em] uppercase shadow-2xl border border-white/20">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <div className="mb-8">
              <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-2">{product.brand}</span>
              <div className="flex justify-between items-start mb-4">
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${isSoldOut ? 'text-stone-400' : 'text-stone-900'}`}>
                  {product.name}
                </h1>
                {!isSoldOut && (
                  <button 
                    onClick={handleShare}
                    className="p-3 hover:bg-stone-50 transition-colors rounded-full relative group"
                    title="Share Piece"
                  >
                    {copied ? <Check className="text-green-600" /> : <Share2 className="text-stone-900" />}
                  </button>
                )}
              </div>
              <p className={`text-2xl font-bold ${isSoldOut ? 'text-stone-300' : 'gold-text'}`}>
                N{product.price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-8 py-8 border-y border-stone-100">
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400 mb-4">The Detail</h3>
                <p className="text-stone-600 leading-relaxed font-light text-lg italic mb-6">
                  "{product.description}"
                </p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="flex items-center px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        <Tag size={10} className="mr-1.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-3 ${isSoldOut ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  {isSoldOut ? 'Sold Out' : `In Stock (${product.stock} units)`}
                </div>
                <div>•</div>
                <div>Authentic {product.brand}</div>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <button
                onClick={() => onAddToCart(product)}
                disabled={isSoldOut}
                className="w-full bg-stone-900 text-white py-6 text-[11px] font-bold tracking-[0.4em] hover:bg-stone-800 transition-all shadow-2xl uppercase flex items-center justify-center space-x-3 disabled:opacity-20 disabled:grayscale"
              >
                {isSoldOut ? <Ban size={16} /> : <ShoppingBag size={16} />}
                <span>{isSoldOut ? 'Currently Sold Out' : 'Add to Shopping Bag'}</span>
              </button>
              
              <div className="flex items-center justify-center space-x-3 py-6 bg-stone-50 border border-stone-100 rounded-sm">
                <ShieldCheck className="w-5 h-5 gold-text" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
                  {isSoldOut ? 'Restock Notification Coming Soon' : 'Secure Boutique Shipping from London'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
