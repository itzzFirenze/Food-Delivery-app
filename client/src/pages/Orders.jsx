import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaCheckCircle, FaClock, FaTruck, FaTimesCircle, FaReceipt, FaBan } from 'react-icons/fa';
import Swal from 'sweetalert2';
import API from '../services/api';

const Orders = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [cancellingId, setCancellingId] = useState(null);

   useEffect(() => {
      fetchOrders();
   }, []);

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const response = await API.get('/orders');
         setOrders(response.data.data || []);
         setError(null);
      } catch (err) {
         console.error('Error fetching orders:', err);
         if (err.response?.status === 404) {
            setOrders([]);
            setError(null);
         } else {
            setError('Failed to load orders');
         }
      } finally {
         setLoading(false);
      }
   };

   const handleCancelOrder = async (orderId) => {
      const result = await Swal.fire({
         title: 'Cancel Order?',
         text: 'Are you sure you want to cancel this order? This action cannot be undone.',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#ef4444',
         cancelButtonColor: '#6b7280',
         confirmButtonText: 'Yes, cancel it',
         cancelButtonText: 'No, keep it',
         customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2.5 font-semibold',
            cancelButton: 'rounded-lg px-6 py-2.5 font-semibold'
         },
         backdrop: true,
         allowOutsideClick: false
      });

      if (result.isConfirmed) {
         try {
            setCancellingId(orderId);
            await API.patch(`/orders/${orderId}/cancel`);

            setOrders((prevOrders) =>
               prevOrders.map((order) =>
                  order._id === orderId ? { ...order, status: 'Cancelled' } : order
               )
            );

            Swal.fire({
               title: 'Cancelled!',
               text: 'Your order has been cancelled successfully.',
               icon: 'success',
               timer: 2000,
               showConfirmButton: false,
               customClass: {
                  popup: 'rounded-2xl'
               }
            });
         } catch (err) {
            console.error('Error cancelling order:', err);
            Swal.fire({
               title: 'Error!',
               text: err.response?.data?.message || 'Failed to cancel order. Please try again.',
               icon: 'error',
               confirmButtonColor: '#3b82f6',
               customClass: {
                  popup: 'rounded-2xl',
                  confirmButton: 'rounded-lg px-6 py-2.5 font-semibold'
               }
            });
         } finally {
            setCancellingId(null);
         }
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case 'Pending':
            return <FaClock className="text-yellow-500" />;
         case 'Confirmed':
            return <FaCheckCircle className="text-blue-500" />;
         case 'Preparing':
            return <FaBox className="text-purple-500" />;
         case 'Out for Delivery':
            return <FaTruck className="text-indigo-500" />;
         case 'Delivered':
            return <FaCheckCircle className="text-green-500" />;
         case 'Cancelled':
            return <FaTimesCircle className="text-red-500" />;
         default:
            return <FaClock className="text-gray-500" />;
      }
   };

   const getStatusColor = (status) => {
      switch (status) {
         case 'Pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         case 'Confirmed':
            return 'bg-blue-100 text-blue-800 border-blue-200';
         case 'Preparing':
            return 'bg-purple-100 text-purple-800 border-purple-200';
         case 'Out for Delivery':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
         case 'Delivered':
            return 'bg-green-100 text-green-800 border-green-200';
         case 'Cancelled':
            return 'bg-red-100 text-red-800 border-red-200';
         default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
      }
   };

   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
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
                  onClick={fetchOrders}
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition'
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className='min-h-screen bg-gray-50 md:py-0 py-10'>
         <div className='max-w-7xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>My Orders</h1>
               <p className='text-gray-600'>Track and manage your orders</p>
            </div>

            {orders.length === 0 ? (
               <div className='bg-white rounded-3xl p-16 text-center shadow-sm'>
                  <div className='text-6xl mb-4'>📦</div>
                  <h2 className='text-2xl font-semibold text-gray-700 mb-2'>No orders yet</h2>
                  <p className='text-gray-500 mb-6'>Start ordering delicious food now!</p>
                  <Link
                     to='/restaurants'
                     className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition'
                  >
                     Browse Restaurants
                  </Link>
               </div>
            ) : (
               <div className='space-y-6'>
                  {orders.map((order) => (
                     <div key={order._id} className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                        {/* Order Header */}
                        <div className='bg-linear-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200'>
                           <div className='flex flex-wrap items-center justify-between gap-4'>
                              <div className='flex items-center gap-4'>
                                 <div className='bg-white p-3 rounded-xl shadow-sm'>
                                    <FaReceipt className='text-blue-600 text-xl' />
                                 </div>
                                 <div>
                                    <h3 className='text-lg font-semibold text-gray-900'>
                                       Order #{order._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <p className='text-sm text-gray-600'>{formatDate(order.createdAt)}</p>
                                 </div>
                              </div>
                              <div className='flex items-center gap-4'>
                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className='font-semibold text-sm'>{order.status}</span>
                                 </div>
                                 <button
                                    onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                                    className='text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer'
                                 >
                                    {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Order Details */}
                        {selectedOrder === order._id && (
                           <div className='p-6'>
                              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                 {/* Order Items */}
                                 <div className='lg:col-span-2'>
                                    <h4 className='text-lg font-semibold text-gray-900 mb-4'>Order Items</h4>
                                    <div className='space-y-4'>
                                       {order.items.map((item, index) => (
                                          <div key={index} className='flex items-center gap-4 p-4 bg-gray-50 rounded-xl'>
                                             <div className='w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0'>
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
                                                <h5 className='font-semibold text-gray-900'>
                                                   {item.menuItem?.title || 'Item'}
                                                </h5>
                                                <p className='text-sm text-gray-600'>
                                                   Quantity: {item.quantity} × ₹{item.price}
                                                </p>
                                             </div>
                                             <div className='text-right'>
                                                <p className='font-bold text-gray-900'>
                                                   ₹{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 {/* Order Summary & Actions */}
                                 <div className='space-y-6'>
                                    {/* Delivery Address */}
                                    <div className='bg-gray-50 rounded-xl p-4'>
                                       <h4 className='font-semibold text-gray-900 mb-3'>Delivery Address</h4>
                                       <p className='text-sm text-gray-700 leading-relaxed'>
                                          {order.deliveryAddress.street}<br />
                                          {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                                          {order.deliveryAddress.zipCode}<br />
                                          <span className='font-medium'>Phone:</span> {order.deliveryAddress.phone}
                                       </p>
                                    </div>

                                    {/* Payment Info */}
                                    <div className='bg-gray-50 rounded-xl p-4'>
                                       <h4 className='font-semibold text-gray-900 mb-3'>Payment Details</h4>
                                       <div className='space-y-2 text-sm'>
                                          <div className='flex justify-between text-gray-700'>
                                             <span>Payment Method:</span>
                                             <span className='font-medium'>{order.paymentMethod}</span>
                                          </div>
                                          {order.coupon && (
                                             <div className='flex justify-between text-green-600'>
                                                <span>Coupon Applied:</span>
                                                <span className='font-medium'>{order.coupon}</span>
                                             </div>
                                          )}
                                          <div className='border-t border-gray-200 pt-2 mt-2'>
                                             <div className='flex justify-between font-bold text-gray-900'>
                                                <span>Total Amount:</span>
                                                <span>₹{order.totalAmount.toFixed(2)}</span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    {/* Cancel Button */}
                                    {!['Delivered', 'Cancelled', 'Out for Delivery'].includes(order.status) && (
                                       <button
                                          onClick={() => handleCancelOrder(order._id)}
                                          disabled={cancellingId === order._id}
                                          className='w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                                       >
                                          {cancellingId === order._id ? (
                                             <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                             <>
                                                <FaBan /> Cancel Order
                                             </>
                                          )}
                                       </button>
                                    )}

                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Quick Summary */}
                        {selectedOrder !== order._id && (
                           <div className='px-6 py-4 flex items-center justify-between'>
                              <div className='flex items-center gap-6'>
                                 <div className='text-sm text-gray-600'>
                                    <span className='font-medium text-gray-900'>{order.items.length}</span> item(s)
                                 </div>
                                 <div className='text-sm text-gray-600'>
                                    <span className='font-medium'>Payment:</span> {order.paymentMethod}
                                 </div>
                              </div>
                              <div className='text-right'>
                                 <p className='text-2xl font-bold text-gray-900'>₹{order.totalAmount.toFixed(2)}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default Orders;