import React, { useEffect, useState } from 'react';
import { FaEye, FaTimes } from 'react-icons/fa';
import API from '../../services/api';

const OrderTab = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedOrder, setSelectedOrder] = useState(null);

   useEffect(() => {
      // 1. Initial Fetch
      fetchOrders(true);

      // 2. Start Polling (every 5 seconds)
      const interval = setInterval(() => {
         fetchOrders(false);
      }, 5000);

      // 3. Cleanup
      return () => clearInterval(interval);
   }, []);

   const fetchOrders = async (showLoading = true) => {
      try {
         if (showLoading) setLoading(true);
         const response = await API.get('/orders/all-orders');
         setOrders(response.data.data || []);
      } catch (err) {
         console.error('Error fetching orders:', err);
      } finally {
         if (showLoading) setLoading(false);
      }
   };

   if (loading) return <div className="p-12 text-center">Loading orders...</div>;

   return (
      <div className='bg-white rounded-2xl shadow-sm p-6'>
         <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Orders ({orders.length})</h2>

         {orders.length === 0 ? (
            <div className='text-center py-12 text-gray-600'>No orders found</div>
         ) : (
            <div className='overflow-x-auto'>
               <table className='w-full'>
                  <thead className='bg-gray-50'>
                     <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Order ID</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>User</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Total</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                     </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                     {orders.map((order) => (
                        <tr key={order._id}>
                           <td className='px-6 py-4 whitespace-nowrap'>{order._id.substring(0, 8)}...</td>
                           <td className='px-6 py-4 whitespace-nowrap'>{order.userId?.name || 'Unknown'}</td>
                           <td className='px-6 py-4 whitespace-nowrap font-bold'>₹{order.totalAmount?.toFixed(2)}</td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                               }`}>{order.status}</span>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <button onClick={() => setSelectedOrder(order)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer'><FaEye /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Order Detail Modal */}
         {selectedOrder && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto'>
                  <div className='flex justify-between mb-4'>
                     <h2 className='text-2xl font-bold'>Order Details</h2>
                     <button onClick={() => setSelectedOrder(null)} className='cursor-pointer'><FaTimes /></button>
                  </div>
                  <div className='space-y-4'>
                     <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                     <p><strong>Status:</strong> {selectedOrder.status}</p>
                     <p><strong>Items:</strong></p>
                     <ul className='bg-gray-50 p-4 rounded-lg'>
                        {selectedOrder.items?.map((item, idx) => (
                           <li key={idx} className='flex justify-between py-2 border-b last:border-0'>
                              <span>{item.menuItem?.title || 'Item'} (x{item.quantity})</span>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                           </li>
                        ))}
                     </ul>
                     <p className='text-xl font-bold text-right'>Total: ₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                  <div className='mt-6'>
                     <button onClick={() => setSelectedOrder(null)} className='w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg cursor-pointer font-semibold'>Close</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default OrderTab;