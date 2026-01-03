
import React from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-widest text-stone-900">
              RHRAH<span className="gold-text font-light">LUXURY</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium tracking-widest hover:text-[#C5A059] transition-colors">HOME</Link>
            <a href="#shop" className="text-sm font-medium tracking-widest hover:text-[#C5A059] transition-colors uppercase">Abayas</a>
            <Link to="/checkout" className="relative group">
              <ShoppingBag className="w-6 h-6 text-stone-900 group-hover:text-[#C5A059] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link to="/checkout" className="relative group">
              <ShoppingBag className="w-6 h-6 text-stone-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-900">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 py-4 px-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium tracking-widest">HOME</Link>
          <a href="#shop" onClick={() => setIsOpen(false)} className="block text-lg font-medium tracking-widest uppercase">Abayas</a>
          <Link to="/checkout" onClick={() => setIsOpen(false)} className="block text-lg font-medium tracking-widest">MY CART</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
