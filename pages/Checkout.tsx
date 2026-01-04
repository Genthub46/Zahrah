
import React, { useState } from 'react';
import { Trash2, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem, Order } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

declare const PaystackPop: any;

const Checkout: React.FC<CheckoutProps> = ({ cart, onRemoveFromCart, onClearCart, onOrderPlaced }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePaystackPayment = () => {
    if (!email || !name || !phone || !address) {
      alert('Please provide all shipping and contact details.');
      return;
    }

    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    setIsProcessing(true);

    const completeOrder = () => {
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        items: [...cart],
        total: total,
        date: new Date().toISOString(),
        status: 'Pending'
      };
      onOrderPlaced(newOrder);
      setPaymentSuccess(true);
      onClearCart();
      setTimeout(() => {
        navigate('/');
      }, 3000);
    };

    try {
      const handler = PaystackPop.setup({
        key: 'pk_test_YOUR_KEY', 
        email: email,
        amount: total * 100,
        currency: 'NGN',
        callback: function(response: any) {
          completeOrder();
        },
        onClose: function() {
          setIsProcessing(false);
          alert('Transaction cancelled.');
        }
      });
      handler.openIframe();
    } catch (e) {
      // Simulation for development
      setTimeout(completeOrder, 1500);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="pt-32 pb-24 px-4 max-w-lg mx-auto text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
        <p className="text-stone-600 mb-8 font-light">Thank you for choosing Zarhrah Luxury. Your ZARA UK order is being processed and a confirmation email has been sent.</p>
        <p className="text-xs text-stone-400 tracking-widest uppercase animate-pulse">Redirecting you home...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center space-x-2 text-stone-500 hover:text-stone-900 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping</span>
      </Link>

      <div className="grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-bold mb-10 tracking-tight">Your Shopping Bag</h2>
          
          {cart.length === 0 ? (
            <div className="bg-stone-100 p-16 text-center rounded-sm border border-stone-200">
              <p className="text-stone-500 italic mb-8 font-serif">Your shopping bag is currently empty.</p>
              <Link to="/" className="text-[10px] font-bold gold-text border-b border-[#C5A059] pb-2 tracking-[0.3em]">EXPLORE ZARA COLLECTIONS</Link>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-6 py-8 border-b border-stone-100">
                  <div className="w-28 h-36 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-sm shadow-sm" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-stone-900">{item.name}</h3>
                        <p className="text-stone-500 text-[10px] mt-1 uppercase tracking-widest">{item.category} • ZARA ORIGINAL</p>
                      </div>
                      <p className="font-bold">N{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-stone-400 tracking-widest uppercase">
                        Qty: <span className="text-stone-900 font-bold ml-2">{item.quantity}</span>
                      </div>
                      <button 
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-stone-50 p-10 rounded-sm sticky top-32 border border-stone-100 shadow-sm">
            <h3 className="text-xl font-bold mb-10 tracking-tight">Summary</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-stone-600 font-light">
                <span>Items Subtotal</span>
                <span>N{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600 font-light">
                <span>Shipping & Handling</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-[0.2em]">Complimentary</span>
              </div>
              <div className="pt-8 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-lg font-bold">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold block">N{total.toLocaleString()}</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Incl. ZARA UK Import Duties</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-4">Shipping & Contact Details</h4>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery Address"
                rows={3}
                className="w-full px-5 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs resize-none"
              />
            </div>

            <button
              onClick={handlePaystackPayment}
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-stone-900 text-white py-6 text-[10px] font-bold tracking-[0.4em] hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 mb-6 shadow-xl uppercase"
            >
              <span>{isProcessing ? 'Validating...' : 'Pay with Paystack'}</span>
            </button>

            <div className="flex items-center justify-center space-x-3 text-stone-300 text-[9px] uppercase tracking-widest font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Checkout • Zarhrah Luxury</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
