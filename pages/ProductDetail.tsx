
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, RestockRequest } from '../types';
import { 
  ArrowLeft, Share2, Check, ShoppingBag, Ban, 
  Mail, Bell, Truck, Globe, Award, Sparkles, Send,
  Plus, Minus, Heart, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView: (id: string) => void;
  onAddRestockRequest: (request: RestockRequest) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  products, 
  onAddToCart, 
  onLogView, 
  onAddRestockRequest,
  onToggleWishlist,
  wishlist
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>('description');
  const [copied, setCopied] = useState(false);
  const [restockEmail, setRestockEmail] = useState('');
  const [isRestockSubmitted, setIsRestockSubmitted] = useState(false);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const isSoldOut = product ? product.stock <= 0 : false;
  const isWishlisted = product ? wishlist.some(p => p.id === product.id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (product) {
      onLogView(product.id);
      if (product.colors?.length) setSelectedColor(product.colors[0].name);
      if (product.sizes?.length) setSelectedSize(product.sizes[0]);
    }
  }, [id, product, onLogView]);

  if (!product) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.brand === product.brand)
    .slice(0, 4);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="pt-24 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mt-8">
          {/* Gallery Sidebar */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all p-1 bg-stone-50 ${activeImgIdx === idx ? 'border-stone-900' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-contain" alt="" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden flex items-center justify-center p-8">
              <img 
                src={product.images[activeImgIdx]} 
                alt={product.name} 
                className={`max-h-full max-w-full object-contain ${isSoldOut ? 'grayscale' : ''}`}
              />
            </div>
            {isSoldOut && (
              <div className="absolute top-8 left-8">
                <span className="bg-red-500 text-white px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-full">Sold Out</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black gold-text uppercase tracking-[0.4em]">{product.brand}</span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-stone-900">
                N{product.price.toLocaleString()}
              </p>
            </div>

            {/* Attributes Selection */}
            <div className="space-y-8 py-6 border-t border-stone-100">
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Colour</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => (
                      <button 
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex flex-col items-center space-y-2`}
                      >
                        <div 
                          className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === c.name ? 'border-stone-900' : 'border-transparent'}`}
                        >
                          <div className="w-full h-full rounded-full border border-stone-200" style={{ backgroundColor: c.hex }} />
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedColor === c.name ? 'text-stone-900' : 'text-stone-400'}`}>
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Size</span>
                    <button className="text-[10px] font-bold text-stone-900 border-b border-stone-900 uppercase tracking-widest">Size Chart</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-2 transition-all rounded-sm ${selectedSize === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-400 hover:border-stone-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex items-center justify-between border-2 border-stone-200 px-4 py-4 rounded-sm">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-400 hover:text-stone-900"><Minus size={16} /></button>
                  <span className="text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="text-stone-400 hover:text-stone-900"><Plus size={16} /></button>
                </div>
                <button 
                  onClick={() => !isSoldOut && onAddToCart(product, quantity, selectedColor, selectedSize)}
                  disabled={isSoldOut}
                  className={`col-span-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm shadow-sm transition-all flex items-center justify-center space-x-3 ${isSoldOut ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                >
                  {isSoldOut ? <Ban size={18} /> : <ShoppingBag size={18} />}
                  <span>{isSoldOut ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => onToggleWishlist(product)}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 border-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-stone-200 text-stone-900 hover:border-stone-400'}`}
                >
                  <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-3 py-4 border-2 border-stone-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-stone-400 transition-all"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Waitlist for Sold Out */}
            {isSoldOut && (
               <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 mt-8">
                <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center text-stone-900">
                  <Bell size={16} className="mr-3" /> Join the Boutique Waitlist
                </h4>
                <AnimatePresence mode="wait">
                  {!isRestockSubmitted ? (
                    <motion.form 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        onAddRestockRequest({ id: Date.now().toString(), productId: product.id, customerEmail: restockEmail, date: new Date().toISOString() });
                        setIsRestockSubmitted(true);
                      }} 
                      className="space-y-3"
                    >
                      <input 
                        type="email" required placeholder="EMAIL ADDRESS" value={restockEmail} onChange={(e) => setRestockEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-stone-200 text-[10px] font-bold tracking-widest uppercase rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                      <button className="w-full bg-stone-900 text-white py-3 text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-stone-800 transition-all">Notify Me</button>
                    </motion.form>
                  ) : (
                    <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-[10px] font-bold text-green-700 uppercase">You've been added to the waitlist.</motion.p>
                  )}
                </AnimatePresence>
               </div>
            )}

            {/* Accordion Sections */}
            <div className="pt-10 space-y-0 border-t border-stone-100">
              <Accordion 
                title="Product Description" 
                isOpen={activeSection === 'description'} 
                onToggle={() => toggleSection('description')}
              >
                <div className="space-y-6">
                  <p className="text-stone-500 leading-relaxed font-light">{product.description}</p>
                  
                  {product.features && (
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Features</h4>
                      <ul className="space-y-2">
                        {product.features.map((f, i) => (
                          <li key={i} className="text-stone-500 text-xs flex items-start">
                            <span className="mr-2 text-stone-300">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Accordion>

              <Accordion 
                title="Product Specifications" 
                isOpen={activeSection === 'specs'} 
                onToggle={() => toggleSection('specs')}
              >
                {product.specifications ? (
                  <ul className="space-y-3">
                    {product.specifications.map((s, i) => (
                      <li key={i} className="text-stone-500 text-xs flex items-center justify-between">
                        <span className="font-medium text-stone-900 uppercase tracking-tighter">{s}</span>
                        <Check size={12} className="text-stone-300" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-stone-400 italic text-xs">Standard boutique specifications apply.</p>
                )}
              </Accordion>

              <Accordion 
                title="Shipping & Returns" 
                isOpen={activeSection === 'shipping'} 
                onToggle={() => toggleSection('shipping')}
              >
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Truck size={20} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">London to Lagos</p>
                      <p className="text-xs text-stone-500 font-light mt-1">7-14 Days delivery across Nigeria via insured partners.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Globe size={20} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Global Logistics</p>
                      <p className="text-xs text-stone-500 font-light mt-1">Authentic original pieces sourced directly from flagship stores.</p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Recommended Grid */}
        <section className="mt-32 pt-24 border-t border-stone-100">
          <div className="flex justify-between items-end mb-16">
             <h2 className="text-4xl font-bold tracking-tight text-stone-900">Customers also viewed</h2>
             <Link to="/" className="text-[10px] font-bold uppercase tracking-widest border-b border-stone-900 pb-2">View Catalog</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.some(wi => wi.id === p.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const Accordion = ({ title, children, isOpen, onToggle }: { title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void }) => (
  <div className="border-b border-stone-100">
    <button 
      onClick={onToggle}
      className="w-full py-6 flex justify-between items-center group"
    >
      <span className="text-xl font-bold tracking-tight text-stone-900">{title}</span>
      {isOpen ? <ChevronUp className="text-stone-400 group-hover:text-stone-900 transition-colors" /> : <ChevronDown className="text-stone-400 group-hover:text-stone-900 transition-colors" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pb-8"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ProductDetail;
