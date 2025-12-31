import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaTag } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import API from '../services/api';

const Cart = () => {
   const navigate = useNavigate();
   const [cart, setCart] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [address, setAddress] = useState({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      phone: ''
   });
   const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
   const [couponCode, setCouponCode] = useState('');
   const [appliedCoupon, setAppliedCoupon] = useState(null);
   const [couponError, setCouponError] = useState('');
   const [couponLoading, setCouponLoading] = useState(false);

   useEffect(() => {
      fetchCart();
   }, []);

   const fetchCart = async (showLoading = true) => {
      try {
         if (showLoading) {
            setLoading(true);
         }
         const response = await API.get('/cart');
         setCart(response.data.data);
      } catch (err) {
         console.error('Error fetching cart:', err);
         if (err.response?.status === 404) {
            setCart({ items: [] });
         } else {
            setError('Failed to load cart');
         }
         setLoading(false);
      } finally {
         if (showLoading) {
            setLoading(false);
         }
      }
   };

   const updateQuantity = async (itemId, menuItemId, newQuantity) => {
      if (newQuantity < 1) {
         removeItem(itemId);
         return;
      }
      try {
         await API.patch('/cart/update', {
            menuItemId: menuItemId,
            quantity: newQuantity
         });
         fetchCart(false);
      } catch (err) {
         console.error('Error updating quantity:', err);
         toast.error('Failed to update quantity');
      }
   };

   const removeItem = async (itemId) => {
      const result = await Swal.fire({
         title: 'Remove Item?',
         text: 'Are you sure you want to remove this item from your cart?',
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: '#ef4444',
         cancelButtonColor: '#6b7280',
         confirmButtonText: 'Yes, remove it',
         cancelButtonText: 'Cancel',
         customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
            cancelButton: 'rounded-lg px-6 py-2.5 font-semibold'
         }
      });

      if (result.isConfirmed) {
         try {
            await API.delete(`/cart/item/${itemId}`);
            fetchCart(false);
            toast.success('Item removed from cart');
         } catch (err) {
            console.error('Error removing item:', err);
            toast.error('Failed to remove item');
         }
      }
   };

   const clearCart = async () => {
      const result = await Swal.fire({
         title: 'Clear Cart?',
         text: 'Are you sure you want to remove all items from your cart?',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#ef4444',
         cancelButtonColor: '#6b7280',
         confirmButtonText: 'Yes, clear it!',
         cancelButtonText: 'Cancel',
         customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
            cancelButton: 'rounded-lg px-6 py-2.5 font-semibold'
         },
         backdrop: true,
         allowOutsideClick: true
      });

      if (result.isConfirmed) {
         try {
            await API.delete('/cart/clear');
            setAppliedCoupon(null);
            setCouponCode('');
            fetchCart();

            Swal.fire({
               title: 'Cleared!',
               text: 'Your cart has been cleared successfully.',
               icon: 'success',
               timer: 2000,
               showConfirmButton: false,
               customClass: {
                  popup: 'rounded-2xl'
               }
            });
         } catch (err) {
            console.error('Error clearing cart:', err);
            Swal.fire({
               title: 'Error!',
               text: 'Failed to clear cart. Please try again.',
               icon: 'error',
               confirmButtonColor: '#3b82f6',
               customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
               }
            });
         }
      }
   };

   const validateCoupon = async () => {
      if (!couponCode.trim()) {
         setCouponError('Please enter a coupon code');
         return;
      }
      setCouponLoading(true);
      setCouponError('');
      try {
         const response = await API.get(`/coupons/validate/${couponCode.trim()}`);
         setAppliedCoupon(response.data.data);
         setCouponError('');

         Swal.fire({
            title: 'Success!',
            text: 'Coupon applied successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
               popup: 'rounded-2xl'
            }
         });
      } catch (err) {
         console.error('Error validating coupon:', err);
         setCouponError(err.response?.data?.message || 'Invalid coupon code');
         setAppliedCoupon(null);
      } finally {
         setCouponLoading(false);
      }
   };

   const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
   };

   const calculateSubtotal = () => {
      if (!cart || !cart.items) return 0;
      return cart.items.reduce((total, item) => {
         return total + (item.menuItem?.price || 0) * item.quantity;
      }, 0);
   };

   const calculateTax = () => {
      return calculateSubtotal() * 0.05;
   };

   const calculateDeliveryFee = () => {
      return calculateSubtotal() > 0 ? 40 : 0;
   };

   const calculateDiscount = () => {
      if (!appliedCoupon) return 0;
      const subtotal = calculateSubtotal();
      if (appliedCoupon.discountType === 'percentage') {
         return (subtotal * appliedCoupon.discountValue) / 100;
      } else {
         return appliedCoupon.discountValue;
      }
   };

   const calculateTotal = () => {
      return calculateSubtotal() + calculateTax() + calculateDeliveryFee() - calculateDiscount();
   };

   const handlePlaceOrder = async () => {
      if (!cart || cart.items.length === 0) {
         Swal.fire({
            title: 'Empty Cart',
            text: 'Your cart is empty. Add items to place an order.',
            icon: 'info',
            confirmButtonColor: '#3b82f6',
            customClass: {
               popup: 'rounded-2xl',
               confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
            }
         });
         return;
      }

      if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
         Swal.fire({
            title: 'Incomplete Address',
            text: 'Please fill in all address fields before placing your order.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            customClass: {
               popup: 'rounded-2xl',
               confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
            }
         });
         return;
      }

      try {
         const orderData = {
            deliveryAddress: {
               street: address.street,
               state: address.state,
               phone: address.phone,
               zipCode: address.zipCode,
               city: address.city
            },
            paymentMethod: paymentMethod,
            couponCode: appliedCoupon?.code || undefined
         };

         await API.post('/orders', orderData);

         await Swal.fire({
            title: 'Order Placed!',
            text: 'Your order has been placed successfully.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'View Orders',
            customClass: {
               popup: 'rounded-2xl',
               confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
            }
         });

         setAppliedCoupon(null);
         setCouponCode('');
         setAddress({
            street: '',
            city: '',
            phone: '',
            state: '',
            zipCode: ''
         });
         navigate('/orders');
      } catch (error) {
         console.error('Error placing order:', error);
         Swal.fire({
            title: 'Order Failed',
            text: error.response?.data?.message || 'Failed to place order. Please try again.',
            icon: 'error',
            confirmButtonColor: '#3b82f6',
            customClass: {
               popup: 'rounded-2xl',
               confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
            }
         });
      }
   };

   if (loading) {
      return (
         <div className='flex justify-center items-center min-h-screen bg-gray-50'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
            <div className='text-center'>
               <div className='text-red-500 font-semibold text-lg mb-4'>{error}</div>
               <button
                  onClick={fetchCart}
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition'
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   const isEmpty = !cart || !cart.items || cart.items.length === 0;

   return (
      <div className='min-h-screen bg-gray-50 md:py-0 py-10'>
         <Toaster position='top-center' reverseOrder={false} />
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <div className='flex items-center justify-between mb-8'>
               <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>Shopping Cart</h1>
               {!isEmpty && (
                  <button
                     onClick={clearCart}
                     className='cursor-pointer text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition text-sm md:text-base'
                  >
                     <FaTrash /> Clear Cart
                  </button>
               )}
            </div>

            {isEmpty ? (
               <div className='bg-white rounded-3xl p-8 md:p-16 text-center shadow-sm'>
                  <div className='text-6xl mb-4'>🛒</div>
                  <h2 className='text-2xl font-semibold text-gray-700 mb-2'>Your cart is empty</h2>
                  <p className='text-gray-500 mb-6'>Add some delicious items to get started!</p>
                  <Link
                     to='/restaurants'
                     className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition'
                  >
                     Browse Restaurants
                  </Link>
               </div>
            ) : (
               <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                  <div className='lg:col-span-2 space-y-6'>
                     <div className='bg-white rounded-2xl shadow-sm p-4 md:p-6'>
                        {/* Header - Hidden on Mobile */}
                        <div className='hidden md:grid grid-cols-12 gap-4 text-xl font-medium text-gray-700 pb-4 border-b border-gray-200'>
                           <div className='col-span-4'>Item</div>
                           <div className='col-span-2 text-center'>Price</div>
                           <div className='col-span-3 text-center'>Quantity</div>
                           <div className='col-span-2 text-center'>Total</div>
                           <div className='col-span-1'></div>
                        </div>

                        {/* Cart Items */}
                        <div className='divide-y divide-gray-100'>
                           {cart.items.map((item) => (
                              <div
                                 key={item._id}
                                 className='flex flex-col md:grid md:grid-cols-12 gap-4 py-6 items-center border-b border-gray-100 last:border-0'
                              >
                                 {/* Image & Title Section */}
                                 <div className='md:col-span-4 flex items-center gap-4 w-full'>
                                    <div className='w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0'>
                                       {item.menuItem?.image ? (
                                          <img
                                             src={item.menuItem.image}
                                             alt={item.menuItem.title}
                                             className='w-full h-full object-cover'
                                          />
                                       ) : (
                                          <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
                                             No image
                                          </div>
                                       )}
                                    </div>
                                    <div className='flex-1'>
                                       <h3 className='font-semibold text-gray-900'>{item.menuItem?.title || 'Item'}</h3>
                                       <div className={`mt-1 w-5 h-5 border-2 rounded flex items-center justify-center ${item.menuItem?.veg ? 'border-green-600' : 'border-red-500'}`}>
                                          <div className={`w-2.5 h-2.5 rounded-full ${item.menuItem?.veg ? 'bg-green-600' : 'bg-red-500'}`} />
                                       </div>
                                       {/* Mobile Price Display */}
                                       <p className='md:hidden text-gray-900 font-semibold mt-1'>
                                          ₹{item.menuItem?.price || 0}
                                       </p>
                                    </div>
                                 </div>

                                 {/* Desktop Price */}
                                 <div className='hidden md:block md:col-span-2 text-center'>
                                    <p className='text-lg font-semibold text-gray-900'>
                                       ₹{item.menuItem?.price || 0}
                                    </p>
                                 </div>

                                 {/* Controls Wrapper - Flex on Mobile, Contents on Desktop */}
                                 <div className='flex items-center justify-between w-full md:contents'>
                                    {/* Quantity Controls */}
                                    <div className='md:col-span-3 flex justify-center'>
                                       <div className='flex items-center gap-3 bg-gray-100 rounded-xl'>
                                          <button
                                             onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity - 1)}
                                             className='text-gray-700 font-bold text-xl px-4 py-2 hover:bg-gray-200 rounded-l-xl transition cursor-pointer'
                                          >
                                             -
                                          </button>
                                          <span className='text-lg font-semibold text-gray-900 min-w-8 text-center'>
                                             {item.quantity}
                                          </span>
                                          <button
                                             onClick={() => updateQuantity(item._id, item.menuItem._id, item.quantity + 1)}
                                             className='text-gray-700 font-bold text-xl px-4 py-2 hover:bg-gray-200 rounded-r-xl transition cursor-pointer'
                                          >
                                             +
                                          </button>
                                       </div>
                                    </div>

                                    {/* Total Price */}
                                    <div className='md:col-span-2 text-center'>
                                       <span className='md:hidden text-sm text-gray-500 mr-2'>Total:</span>
                                       <span className='text-lg font-bold text-gray-900'>
                                          ₹{(item.menuItem?.price || 0) * item.quantity}
                                       </span>
                                    </div>

                                    {/* Delete Button */}
                                    <div className='md:col-span-1 flex justify-end'>
                                       <button
                                          onClick={() => removeItem(item._id)}
                                          className='text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition cursor-pointer'
                                       >
                                          <FaTrash />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Delivery Address</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                           <input
                              type='text'
                              placeholder='Street Address'
                              value={address.street}
                              onChange={(e) => setAddress({ ...address, street: e.target.value })}
                              className='col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                           />
                           <input
                              type='text'
                              placeholder='City'
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                           />
                           <input
                              type='text'
                              placeholder='State'
                              value={address.state}
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                           />
                           <input
                              type='text'
                              placeholder='ZIP Code'
                              value={address.zipCode}
                              onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                              className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                           />
                           <input
                              type='tel'
                              placeholder='Phone Number'
                              value={address.phone}
                              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                              className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                           />
                        </div>
                     </div>
                  </div>

                  <div className='space-y-6'>
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                           <FaTag className='text-blue-600' />
                           Apply Coupon
                        </h2>
                        {appliedCoupon ? (
                           <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                              <div className='flex items-center justify-between mb-2'>
                                 <div className='flex items-center gap-2'>
                                    <FaTag className='text-green-600' />
                                    <span className='font-semibold text-green-800'>{appliedCoupon.code}</span>
                                 </div>
                                 <button
                                    onClick={removeCoupon}
                                    className='text-red-500 hover:text-red-700 text-sm font-medium'
                                 >
                                    Remove
                                 </button>
                              </div>
                              <p className='text-sm text-green-700'>
                                 {appliedCoupon.discountType === 'percentage'
                                    ? `${appliedCoupon.discountValue}% off`
                                    : `₹${appliedCoupon.discountValue} off`}
                              </p>
                           </div>
                        ) : (
                           <div>
                              <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                                 <input
                                    type='text'
                                    placeholder='Enter coupon code'
                                    value={couponCode}
                                    onChange={(e) => {
                                       setCouponCode(e.target.value.toUpperCase());
                                       setCouponError('');
                                    }}
                                    className='w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                 />
                                 <button
                                    onClick={validateCoupon}
                                    disabled={couponLoading}
                                    className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer'
                                 >
                                    {couponLoading ? 'Checking...' : 'Apply'}
                                 </button>
                              </div>
                              {couponError && (
                                 <p className='text-red-500 text-sm mt-2'>{couponError}</p>
                              )}
                           </div>
                        )}
                     </div>

                     <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-4'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Order Summary</h2>
                        <div className='space-y-4 mb-6'>
                           <div className='flex justify-between text-gray-700'>
                              <span>Subtotal</span>
                              <span className='font-semibold'>₹{calculateSubtotal().toFixed(2)}</span>
                           </div>
                           <div className='flex justify-between text-gray-700'>
                              <span>Tax (5%)</span>
                              <span className='font-semibold'>₹{calculateTax().toFixed(2)}</span>
                           </div>
                           <div className='flex justify-between text-gray-700'>
                              <span>Delivery Fee</span>
                              <span className='font-semibold'>₹{calculateDeliveryFee().toFixed(2)}</span>
                           </div>
                           {appliedCoupon && (
                              <div className='flex justify-between text-green-600'>
                                 <span>Discount ({appliedCoupon.code})</span>
                                 <span className='font-semibold'>-₹{calculateDiscount().toFixed(2)}</span>
                              </div>
                           )}
                           <div className='border-t border-gray-200 pt-4'>
                              <div className='flex justify-between text-xl font-bold text-gray-900'>
                                 <span>Total</span>
                                 <span>₹{calculateTotal().toFixed(2)}</span>
                              </div>
                           </div>
                        </div>

                        <div className='mb-6'>
                           <h3 className='text-lg font-semibold text-gray-900 mb-3'>Payment Method</h3>
                           <div className='space-y-2'>
                              <label className='flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition'>
                                 <input
                                    type='radio'
                                    name='payment'
                                    value='Cash on Delivery'
                                    checked={paymentMethod === 'Cash on Delivery'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className='w-4 h-4 text-blue-600'
                                 />
                                 <span className='font-medium text-gray-700'>Cash on Delivery</span>
                              </label>
                              <label className='flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition'>
                                 <input
                                    type='radio'
                                    name='payment'
                                    value='Debit Card'
                                    checked={paymentMethod === 'Debit Card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className='w-4 h-4 text-blue-600'
                                 />
                                 <span className='font-medium text-gray-700'>Card Payment</span>
                              </label>
                              <label className='flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition'>
                                 <input
                                    type='radio'
                                    name='payment'
                                    value='Online Payment'
                                    checked={paymentMethod === 'Online Payment'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className='w-4 h-4 text-blue-600'
                                 />
                                 <span className='font-medium text-gray-700'>UPI</span>
                              </label>
                           </div>
                        </div>

                        <button
                           onClick={handlePlaceOrder}
                           className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer'
                        >
                           Place Order
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default Cart;