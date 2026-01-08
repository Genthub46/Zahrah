// import React from 'react';
// import { Product } from '../types';
// import ProductCard from '../components/ProductCard';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Sparkles, Filter, Grid } from 'lucide-react';
// import { Link } from 'react-router-dom';

// interface ArrivalsProps {
//   products: Product[];
//   onToggleWishlist: (product: Product) => void;
//   wishlist: Product[];
// }

// const Arrivals: React.FC<ArrivalsProps> = ({ products, onToggleWishlist, wishlist }) => {
//   const isWishlisted = (id: string) => wishlist.some(p => p.id === id);

//   return (
//     <div className="min-h-screen bg-[#0c0a09] pt-48 pb-40">
//       <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
//         <Link 
//           to="/" 
//           className="inline-flex items-center space-x-4 text-[11px] font-black uppercase tracking-[0.5em] text-stone-500 hover:text-[#C5A059] transition-all mb-20 group"
//         >
//           <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-2" />
//           <span>Exit Global Archive</span>
//         </Link>

//         <header className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-16">
//           <div className="max-w-4xl">
//             <div className="flex items-center space-x-6 mb-8">
//                <div className="p-3 bg-[#141211] border border-[#C5A059]/20 rounded-xl">
//                  <Sparkles className="gold-text" size={20} />
//                </div>
//                <span className="text-[13px] font-black gold-text uppercase tracking-[0.6em]">Premium Sourced Artifacts</span>
//             </div>
//             <h1 className="text-7xl md:text-9xl font-black text-white italic serif uppercase tracking-tighter leading-none mb-10">New Drops</h1>
//             <p className="text-stone-500 text-xl font-medium leading-relaxed tracking-wide max-w-3xl border-l-2 border-[#C5A059]/20 pl-8">
//               A curated selection of the latest artifacts sourced from London flagship boutiques. Featuring exclusive ZARA UK limited releases, bespoke timepieces, and high-end accessories.
//             </p>
//           </div>
          
//           <div className="flex items-center space-x-6">
//              <button className="px-10 py-4 bg-[#141211] border border-stone-800 text-stone-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-xl shadow-2xl flex items-center hover:text-white hover:border-[#C5A059] transition-all">
//                <Filter size={14} className="mr-4" /> Filter Selection
//              </button>
//              <button className="p-4 bg-white text-black rounded-xl shadow-2xl">
//                <Grid size={20} />
//              </button>
//           </div>
//         </header>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-32">
//           {products.map((product) => (
//             <ProductCard 
//               key={product.id} 
//               product={product} 
//               onToggleWishlist={onToggleWishlist}
//               isWishlisted={isWishlisted(product.id)}
//             />
//           ))}
//         </div>

//         {products.length === 0 && (
//           <div className="py-60 text-center border-y border-white/5">
//             <p className="text-stone-600 serif italic text-3xl tracking-widest uppercase">Vault Empty • Replenishing Stock</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Arrivals;