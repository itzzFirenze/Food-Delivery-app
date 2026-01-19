import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaTag, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import API from '../services/api';
import PaymentGateway from '../components/PaymentGateway';

const Cart = () => {
   const navigate = useNavigate();
   const [cart, setCart] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [address, setAddress] = useState({
      street: '', city: '', state: '', zipCode: '', phone: ''
   });

   const [paymentOption, setPaymentOption] = useState('online');
   const [couponCode, setCouponCode] = useState('');
   const [appliedCoupon, setAppliedCoupon] = useState(null);
   const [couponError, setCouponError] = useState('');
   const [couponLoading, setCouponLoading] = useState(false);
   const [showPaymentModal, setShowPaymentModal] = useState(false);

   useEffect(() => {
      fetchCart();
      fetchPreviousOrderAddress();
   }, []);

   const handlePlaceOrderClick = () => {
      if (!cart || !cart.items || cart.items.length === 0) {
         Swal.fire({
            title: 'Empty Cart',
            text: 'Your cart is empty.',
            icon: 'info',
            confirmButtonColor: '#3b82f6',
            customClass: { popup: 'rounded-2xl' }
         });
         return;
      }

      if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
         Swal.fire({
            title: 'Incomplete Address',
            text: 'Please fill in all address fields.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            customClass: { popup: 'rounded-2xl' }
         });
         return;
      }

      if (paymentOption === 'cod') {
         Swal.fire({
            title: 'Confirm Order?',
            text: `Place order for ₹${calculateTotal().toFixed(2)} via Cash on Delivery?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Place Order'
         }).then((result) => {
            if (result.isConfirmed) {
               processOrderAPI({ method: 'cod' });
            }
         });

      } else {
         setShowPaymentModal(true);
      }
   };

   const processOrderAPI = async (paymentDetails) => {
      setShowPaymentModal(false);

      const loadingToast = toast.loading('Processing Order...');

      try {
         let backendMethod = 'Online Payment';

         if (paymentDetails.method === 'cod') backendMethod = 'Cash on Delivery';
         else if (paymentDetails.method === 'card') backendMethod = 'Debit Card';
         else if (paymentDetails.method === 'upi') backendMethod = 'Online Payment';

         const orderData = {
            deliveryAddress: { ...address },
            paymentMethod: backendMethod,
            couponCode: appliedCoupon?.code || undefined,
         };

         await API.post('/orders', orderData);

         toast.dismiss(loadingToast);

         await Swal.fire({
            title: 'Order Placed!',
            text: `Your order has been placed successfully via ${backendMethod}.`,
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'View Orders',
            customClass: { popup: 'rounded-2xl' }
         });

         // Reset States
         setAppliedCoupon(null);
         setCouponCode('');
         setAddress({ street: '', city: '', phone: '', state: '', zipCode: '' });

         navigate('/orders');

      } catch (error) {
         toast.dismiss(loadingToast);
         console.error('Error placing order:', error);
         Swal.fire({
            title: 'Order Failed',
            text: error.response?.data?.message || 'Failed to place order.',
            icon: 'error',
            confirmButtonColor: '#3b82f6',
            customClass: { popup: 'rounded-2xl' }
         });
      }
   };

   const fetchCart = async (showLoading = true) => {
      try {
         if (showLoading) setLoading(true);
         const response = await API.get('/cart');
         setCart(response.data.data);
      } catch (err) {
         if (err.response?.status === 404) setCart({ items: [] });
         else setError('Failed to load cart');
         setLoading(false);
      } finally { if (showLoading) setLoading(false); }
   };

   const fetchPreviousOrderAddress = async () => {
      try {
         const res = await API.get('/orders/latest');
         const addr = res.data?.data?.deliveryAddress;
         if (!addr) return;
         setAddress({
            street: addr.street || '', city: addr.city || '', state: addr.state || '', zipCode: addr.zipCode || '', phone: addr.phone || ''
         });
      } catch (err) { console.log("No previous order found"); }
   };

   const updateQuantity = async (itemId, menuItemId, newQuantity) => {
      if (newQuantity < 1) { removeItem(itemId); return; }
      try {
         await API.patch('/cart/update', { menuItemId, quantity: newQuantity });
         fetchCart(false);
      } catch (err) { toast.error('Failed to update quantity'); }
   };

   const removeItem = async (itemId) => {
      const result = await Swal.fire({
         title: 'Remove Item?', text: 'Remove this item?', icon: 'question', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, remove it'
      });
      if (result.isConfirmed) {
         try {
            await API.delete(`/cart/item/${itemId}`);
            fetchCart(false);
            toast.success('Item removed');
         } catch (err) { toast.error('Failed to remove item'); }
      }
   };

   const clearCart = async () => {
      const result = await Swal.fire({
         title: 'Clear Cart?', text: 'Remove all items?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Yes, clear it!'
      });
      if (result.isConfirmed) {
         try {
            await API.delete('/cart/clear');
            setAppliedCoupon(null); setCouponCode(''); fetchCart();
            Swal.fire('Cleared!', 'Cart cleared.', 'success');
         } catch (err) { Swal.fire('Error!', 'Failed to clear cart.', 'error'); }
      }
   };

   const validateCoupon = async () => {
      if (!couponCode.trim()) { setCouponError('Enter coupon code'); return; }
      setCouponLoading(true); setCouponError('');
      try {
         const response = await API.get(`/coupons/validate/${couponCode.trim()}`);
         setAppliedCoupon(response.data.data);
         toast.success('Coupon applied!');
      } catch (err) { setCouponError(err.response?.data?.message || 'Invalid coupon'); setAppliedCoupon(null); }
      finally { setCouponLoading(false); }
   };

   const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

   const calculateSubtotal = () => cart?.items?.reduce((total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0) || 0;
   const calculateTax = () => calculateSubtotal() * 0.05;
   const calculateDeliveryFee = () => calculateSubtotal() > 0 ? 40 : 0;
   const calculateDiscount = () => {
      if (!appliedCoupon) return 0;
      const sub = calculateSubtotal();
      return appliedCoupon.discountType === 'percentage' ? (sub * appliedCoupon.discountValue) / 100 : appliedCoupon.discountValue;
   };
   const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateDeliveryFee() - calculateDiscount();

   if (loading) return <div className='flex justify-center items-center min-h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div></div>;
   if (error) return <div className='text-center mt-20 text-red-500'>{error}<button onClick={fetchCart} className='block mx-auto mt-4 bg-blue-500 text-white px-4 py-2 rounded'>Retry</button></div>;

   const isEmpty = !cart || !cart.items || cart.items.length === 0;

   return (
      <div className='min-h-screen bg-gray-50 md:py-0 py-10'>
         <Toaster position='top-center' />
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <div className='flex items-center justify-between mb-8'>
               <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>Shopping Cart</h1>
               {!isEmpty && (
                  <button onClick={clearCart} className='text-red-500 hover:text-red-700 font-medium flex items-center gap-2 cursor-pointer'>
                     <FaTrash /> Clear Cart
                  </button>
               )}
            </div>

            {isEmpty ? (
               <div className='bg-white rounded-3xl p-16 text-center shadow-sm'>
                  <div className='text-6xl mb-4'>🛒</div>
                  <h2 className='text-2xl font-semibold text-gray-700 mb-2'>Your cart is empty</h2>
                  <Link to='/restaurants' className='inline-block bg-blue-600 text-white px-8 py-3 rounded-full mt-4'>Browse Restaurants</Link>
               </div>
            ) : (
               <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  {/* Items & Address */}
                  <div className='lg:col-span-2 space-y-6'>
                     {/* Items List */}
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        {cart.items.map((item) => (
                           <div key={item._id} className="flex justify-between items-center border-b border-gray-100 py-4 last:border-0">
                              <div className="flex gap-4">
                                 <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={item.menuItem?.image} alt="" className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <h3 className="font-semibold">{item.menuItem?.title}</h3>
                                    <p className="text-gray-500">₹{item.menuItem?.price}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <button onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity - 1)} className="w-8 h-8 bg-gray-100 rounded-full cursor-pointer">-</button>
                                 <span>{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity + 1)} className="w-8 h-8 bg-gray-100 rounded-full cursor-pointer">+</button>
                              </div>
                              <div className="font-bold">₹{item.menuItem?.price * item.quantity}</div>
                           </div>
                        ))}
                     </div>

                     {/* Address Form */}
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Delivery Address</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                           <input type='text' placeholder='Street' value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className='col-span-2 px-4 py-3 border rounded-lg' />
                           <input type='text' placeholder='City' value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className='px-4 py-3 border rounded-lg' />
                           <input type='text' placeholder='State' value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className='px-4 py-3 border rounded-lg' />
                           <input type='text' placeholder='ZIP' value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} className='px-4 py-3 border rounded-lg' />
                           <input type='text' placeholder='Phone' value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className='px-4 py-3 border rounded-lg' />
                        </div>
                     </div>
                  </div>

                  {/* Summary & Payment */}
                  <div className='space-y-6'>
                     {/* Coupon */}
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'><FaTag className='text-blue-600' /> Apply Coupon</h2>
                        <div className='flex gap-2'>
                           <input type='text' placeholder='Code' value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className='flex-1 border rounded-lg px-3 py-2' />
                           <button onClick={validateCoupon} disabled={couponLoading} className='bg-blue-600 text-white px-4 rounded-lg cursor-pointer'>Apply</button>
                        </div>
                        {appliedCoupon && <p className='text-green-600 mt-2 text-sm'>Coupon Applied: {appliedCoupon.code}</p>}
                        {couponError && <p className='text-red-500 mt-2 text-sm'>{couponError}</p>}
                     </div>

                     {/* Summary */}
                     <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-4'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Order Summary</h2>
                        <div className='space-y-3 mb-6 border-b pb-6'>
                           <div className='flex justify-between'><span>Subtotal</span><span>₹{calculateSubtotal().toFixed(2)}</span></div>
                           <div className='flex justify-between'><span>Tax (5%)</span><span>₹{calculateTax().toFixed(2)}</span></div>
                           <div className='flex justify-between'><span>Delivery Fee</span><span>₹{calculateDeliveryFee().toFixed(2)}</span></div>
                           {appliedCoupon && <div className='flex justify-between text-green-600'><span>Discount</span><span>-₹{calculateDiscount().toFixed(2)}</span></div>}
                           <div className='flex justify-between text-xl font-bold pt-2'><span>Total</span><span>₹{calculateTotal().toFixed(2)}</span></div>
                        </div>

                        {/* PAYMENT METHOD SELECTION */}
                        <div className="mb-6 space-y-3">
                           <h3 className="font-semibold text-gray-800">Payment Options</h3>

                           {/* Option 1: Online */}
                           <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'online' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                              <input
                                 type="radio"
                                 name="payment"
                                 value="online"
                                 checked={paymentOption === 'online'}
                                 onChange={() => setPaymentOption('online')}
                                 className="w-5 h-5 text-blue-600"
                              />
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><FaCreditCard /></div>
                                 <div>
                                    <div className="font-semibold text-gray-900">Pay Online</div>
                                    <div className="text-xs text-gray-500">UPI, Cards, Netbanking</div>
                                 </div>
                              </div>
                           </label>

                           {/* Option 2: COD */}
                           <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentOption === 'cod' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-gray-300'}`}>
                              <input
                                 type="radio"
                                 name="payment"
                                 value="cod"
                                 checked={paymentOption === 'cod'}
                                 onChange={() => setPaymentOption('cod')}
                                 className="w-5 h-5 text-green-600"
                              />
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><FaMoneyBillWave /></div>
                                 <div>
                                    <div className="font-semibold text-gray-900">Cash on Delivery</div>
                                    <div className="text-xs text-gray-500">Pay cash at your doorstep</div>
                                 </div>
                              </div>
                           </label>
                        </div>

                        {/* ACTION BUTTON */}
                        <button
                           onClick={handlePlaceOrderClick}
                           className={`w-full text-white font-semibold text-lg py-4 cursor-pointer rounded-xl transition shadow-md hover:shadow-lg ${paymentOption === 'cod' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                        >
                           {paymentOption === 'cod' ? 'Place Order' : 'Proceed to Pay'}
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Gateway Modal */}
         {showPaymentModal && (
            <PaymentGateway
               totalAmount={calculateTotal()}
               onClose={() => setShowPaymentModal(false)}
               onProcessPayment={processOrderAPI}
            />
         )}
      </div>
   );
};

export default Cart;