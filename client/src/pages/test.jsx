import React, { useEffect, useState } from 'react';
import { FaUsers, FaStore, FaShoppingBag, FaTicketAlt, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaEye } from 'react-icons/fa';
import API from '../services/api';

const AdminDashboard = () => {
   const [activeTab, setActiveTab] = useState('users');
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   // Users
   const [users, setUsers] = useState([]);
   const [selectedUser, setSelectedUser] = useState(null);

   // Restaurants
   const [restaurants, setRestaurants] = useState([]);
   const [selectedRestaurant, setSelectedRestaurant] = useState(null);

   // Orders
   const [orders, setOrders] = useState([]);
   const [selectedOrder, setSelectedOrder] = useState(null);

   // Coupons
   const [coupons, setCoupons] = useState([]);
   const [showCouponForm, setShowCouponForm] = useState(false);
   const [isEditingCoupon, setIsEditingCoupon] = useState(false);
   const [editingCouponId, setEditingCouponId] = useState(null);
   const [couponForm, setCouponForm] = useState({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      expiryDate: '',
      usageLimit: ''
   });

   useEffect(() => {
      fetchData();
   }, [activeTab]);

   const fetchData = async () => {
      try {
         setLoading(true);
         setError(null);

         switch (activeTab) {
            case 'users':
               await fetchUsers();
               break;
            case 'restaurants':
               await fetchRestaurants();
               break;
            case 'orders':
               await fetchOrders();
               break;
            case 'coupons':
               await fetchCoupons();
               break;
            default:
               break;
         }
      } catch (err) {
         console.error('Error fetching data:', err);
         setError('Failed to load data');
      } finally {
         setLoading(false);
      }
   };

   const fetchUsers = async () => {
      try {
         const response = await API.get('/users');
         setUsers(response.data.data || []);
      } catch (err) {
         console.error('Error fetching users:', err);
      }
   };

   const fetchRestaurants = async () => {
      try {
         const response = await API.get('/restaurants');
         setRestaurants(response.data.data || []);
      } catch (err) {
         console.error('Error fetching restaurants:', err);
      }
   };

   const fetchOrders = async () => {
      try {
         const response = await API.get('/orders');
         setOrders(response.data.data || []);
      } catch (err) {
         console.error('Error fetching orders:', err);
      }
   };

   const fetchCoupons = async () => {
      try {
         const response = await API.get('/coupons');
         setCoupons(response.data.data || []);
      } catch (err) {
         console.error('Error fetching coupons:', err);
      }
   };

   const handleDeleteUser = async (userId) => {
      if (!window.confirm('Are you sure you want to delete this user?')) {
         return;
      }

      try {
         await API.delete(`/users/${userId}`);
         alert('User deleted successfully!');
         fetchUsers();
      } catch (err) {
         console.error('Error deleting user:', err);
         alert(err.response?.data?.message || 'Failed to delete user');
      }
   };

   const handleDeleteRestaurant = async (restaurantId) => {
      if (!window.confirm('Are you sure you want to delete this restaurant?')) {
         return;
      }

      try {
         await API.delete(`/restaurants/${restaurantId}`);
         alert('Restaurant deleted successfully!');
         fetchRestaurants();
      } catch (err) {
         console.error('Error deleting restaurant:', err);
         alert(err.response?.data?.message || 'Failed to delete restaurant');
      }
   };

   const handleCouponSubmit = async (e) => {
      e.preventDefault();

      if (!couponForm.code || !couponForm.discountType || !couponForm.discountValue || !couponForm.expiryDate) {
         alert('Please fill in all required fields');
         return;
      }

      try {
         const couponData = {
            ...couponForm,
            discountValue: parseFloat(couponForm.discountValue),
            minOrderAmount: couponForm.minOrderAmount ? parseFloat(couponForm.minOrderAmount) : 0,
            usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null
         };

         if (isEditingCoupon && editingCouponId) {
            await API.patch(`/coupons/${editingCouponId}`, couponData);
            alert('Coupon updated successfully!');
         } else {
            await API.post('/coupons', couponData);
            alert('Coupon created successfully!');
         }

         resetCouponForm();
         fetchCoupons();
      } catch (err) {
         console.error('Error saving coupon:', err);
         alert(err.response?.data?.message || 'Failed to save coupon');
      }
   };

   const handleEditCoupon = (coupon) => {
      setCouponForm({
         code: coupon.code,
         discountType: coupon.discountType,
         discountValue: coupon.discountValue.toString(),
         minOrderAmount: coupon.minOrderAmount?.toString() || '',
         expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
         usageLimit: coupon.usageLimit?.toString() || ''
      });
      setIsEditingCoupon(true);
      setEditingCouponId(coupon._id);
      setShowCouponForm(true);
   };

   const handleDeleteCoupon = async (couponId) => {
      if (!window.confirm('Are you sure you want to delete this coupon?')) {
         return;
      }

      try {
         await API.delete(`/coupons/${couponId}`);
         alert('Coupon deleted successfully!');
         fetchCoupons();
      } catch (err) {
         console.error('Error deleting coupon:', err);
         alert(err.response?.data?.message || 'Failed to delete coupon');
      }
   };

   const resetCouponForm = () => {
      setCouponForm({
         code: '',
         discountType: 'percentage',
         discountValue: '',
         minOrderAmount: '',
         expiryDate: '',
         usageLimit: ''
      });
      setIsEditingCoupon(false);
      setEditingCouponId(null);
      setShowCouponForm(false);
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
                  onClick={fetchData}
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition'
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className='min-h-screen bg-gray-50'>
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>Admin Dashboard</h1>
               <p className='text-gray-600'>Manage users, restaurants, orders, and coupons</p>
            </div>

            <div className='flex flex-wrap gap-4 mb-6'>
               <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === 'users'
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
               >
                  <FaUsers className='inline mr-2' />
                  Users
               </button>
               <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === 'restaurants'
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
               >
                  <FaStore className='inline mr-2' />
                  Restaurants
               </button>
               <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === 'orders'
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
               >
                  <FaShoppingBag className='inline mr-2' />
                  Orders
               </button>
               <button
                  onClick={() => setActiveTab('coupons')}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${activeTab === 'coupons'
                     ? 'bg-blue-600 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
               >
                  <FaTicketAlt className='inline mr-2' />
                  Coupons
               </button>
            </div>

            {activeTab === 'users' && (
               <div className='bg-white rounded-2xl shadow-sm p-6'>
                  <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Users ({users.length})</h2>

                  {users.length === 0 ? (
                     <div className='text-center py-12'>
                        <p className='text-gray-600'>No users found</p>
                     </div>
                  ) : (
                     <div className='overflow-x-auto'>
                        <table className='w-full'>
                           <thead className='bg-gray-50'>
                              <tr>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Phone</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Role</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                              </tr>
                           </thead>
                           <tbody className='bg-white divide-y divide-gray-200'>
                              {users.map((user) => (
                                 <tr key={user._id}>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{user.name}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{user.email}</td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{user.phone || 'N/A'}</td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                          user.role === 'restaurant_owner' ? 'bg-blue-100 text-blue-800' :
                                             'bg-gray-100 text-gray-800'
                                          }`}>
                                          {user.role}
                                       </span>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                       <div className='flex gap-2'>
                                          <button
                                             onClick={() => setSelectedUser(user)}
                                             className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition'
                                          >
                                             <FaEye />
                                          </button>
                                          <button
                                             onClick={() => handleDeleteUser(user._id)}
                                             className='p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition'
                                          >
                                             <FaTrash />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'restaurants' && (
               <div className='bg-white rounded-2xl shadow-sm p-6'>
                  <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Restaurants ({restaurants.length})</h2>

                  {restaurants.length === 0 ? (
                     <div className='text-center py-12'>
                        <p className='text-gray-600'>No restaurants found</p>
                     </div>
                  ) : (
                     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {restaurants.map((restaurant) => (
                           <div key={restaurant._id} className='border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition'>
                              <img
                                 src={restaurant.image}
                                 alt={restaurant.name}
                                 className='w-full h-48 object-cover'
                              />
                              <div className='p-4'>
                                 <div className='flex items-start justify-between mb-2'>
                                    <h3 className='font-semibold text-gray-900 text-lg'>{restaurant.name}</h3>
                                    {restaurant.isVeg && (
                                       <span className='px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>Veg</span>
                                    )}
                                 </div>
                                 <p className='text-sm text-gray-600 mb-4'>{restaurant.address}</p>
                                 <div className='flex gap-2'>
                                    <button
                                       onClick={() => setSelectedRestaurant(restaurant)}
                                       className='flex-1 p-2 cursor-pointer text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-lg transition text-center'
                                    >
                                       <FaEye className='inline mr-1' /> View
                                    </button>
                                    <button
                                       onClick={() => handleDeleteRestaurant(restaurant._id)}
                                       className='flex-1 p-2 cursor-pointer text-red-600 hover:bg-red-100 bg-red-50 rounded-lg transition text-center'
                                    >
                                       <FaTrash className='inline mr-1' /> Delete
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'orders' && (
               <div className='bg-white rounded-2xl shadow-sm p-6'>
                  <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Orders ({orders.length})</h2>

                  {orders.length === 0 ? (
                     <div className='text-center py-12'>
                        <p className='text-gray-600'>No orders found</p>
                     </div>
                  ) : (
                     <div className='overflow-x-auto'>
                        <table className='w-full'>
                           <thead className='bg-gray-50'>
                              <tr>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Order ID</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>User</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Items</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Total</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                                 <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                              </tr>
                           </thead>
                           <tbody className='bg-white divide-y divide-gray-200'>
                              {orders.map((order) => (
                                 <tr key={order._id}>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                       {order._id?.substring(0, 8)}...
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                       {order.userId?.name || 'Unknown'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                                       {order.items?.length || 0} items
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                                       ₹{order.totalAmount?.toFixed(2)}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                             order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                          }`}>
                                          {order.status}
                                       </span>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                                       <button
                                          onClick={() => setSelectedOrder(order)}
                                          className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'
                                       >
                                          <FaEye />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'coupons' && (
               <div className='space-y-6'>
                  {!showCouponForm && (
                     <button
                        onClick={() => setShowCouponForm(true)}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition flex cursor-pointer items-center justify-center gap-2'
                     >
                        <FaPlus /> Add New Coupon
                     </button>
                  )}

                  {showCouponForm && (
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                           {isEditingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                        </h2>

                        <form onSubmit={handleCouponSubmit} className='space-y-4'>
                           <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Coupon Code *
                                 </label>
                                 <input
                                    type='text'
                                    value={couponForm.code}
                                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    placeholder='SAVE20'
                                    required
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Discount Type *
                                 </label>
                                 <select
                                    value={couponForm.discountType}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 >
                                    <option value='percentage'>Percentage (%)</option>
                                    <option value='fixed'>Fixed Amount (₹)</option>
                                 </select>
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Discount Value *
                                 </label>
                                 <input
                                    type='number'
                                    step='0.01'
                                    value={couponForm.discountValue}
                                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    placeholder={couponForm.discountType === 'percentage' ? '20' : '100'}
                                    required
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Min Order Amount
                                 </label>
                                 <input
                                    type='number'
                                    step='0.01'
                                    value={couponForm.minOrderAmount}
                                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    placeholder='500'
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Expiry Date *
                                 </label>
                                 <input
                                    type='date'
                                    value={couponForm.expiryDate}
                                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Usage Limit
                                 </label>
                                 <input
                                    type='number'
                                    value={couponForm.usageLimit}
                                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    placeholder='Unlimited'
                                 />
                              </div>
                           </div>

                           <div className='flex gap-3 pt-4'>
                              <button
                                 type='submit'
                                 className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg cursor-pointer transition'
                              >
                                 <FaSave /> {isEditingCoupon ? 'Update Coupon' : 'Create Coupon'}
                              </button>
                              <button
                                 type='button'
                                 onClick={resetCouponForm}
                                 className='flex-1 flex items-center justify-center cursor-pointer gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition'
                              >
                                 <FaTimes /> Cancel
                              </button>
                           </div>
                        </form>
                     </div>
                  )}

                  <div className='bg-white rounded-2xl shadow-sm p-6'>
                     <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Coupons ({coupons.length})</h2>

                     {coupons.length === 0 ? (
                        <div className='text-center py-12'>
                           <div className='text-6xl mb-4'>🎟️</div>
                           <p className='text-gray-600'>No coupons yet. Create your first coupon!</p>
                        </div>
                     ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                           {coupons.map((coupon) => (
                              <div key={coupon._id} className='border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition'>
                                 <div className='flex items-start justify-between mb-4'>
                                    <div className='bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold text-lg'>
                                       {coupon.code}
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${new Date(coupon.expiryDate) > new Date()
                                       ? 'bg-green-100 text-green-800'
                                       : 'bg-red-100 text-red-800'
                                       }`}>
                                       {new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Expired'}
                                    </span>
                                 </div>

                                 <div className='space-y-2 mb-4'>
                                    <p className='text-2xl font-bold text-gray-900'>
                                       {coupon.discountType === 'percentage'
                                          ? `${coupon.discountValue}% OFF`
                                          : `₹${coupon.discountValue} OFF`}
                                    </p>
                                    {coupon.minOrderAmount > 0 && (
                                       <p className='text-sm text-gray-600'>
                                          Min order: ₹{coupon.minOrderAmount}
                                       </p>
                                    )}
                                    <p className='text-sm text-gray-600'>
                                       Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </p>
                                    {coupon.usageLimit && (
                                       <p className='text-sm text-gray-600'>
                                          Limit: {coupon.usageLimit} uses
                                       </p>
                                    )}
                                 </div>

                                 <div className='flex gap-2'>
                                    <button
                                       onClick={() => handleEditCoupon(coupon)}
                                       className='flex-1 p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition text-center font-semibold'
                                    >
                                       <FaEdit className='inline mr-1' /> Edit
                                    </button>
                                    <button
                                       onClick={() => handleDeleteCoupon(coupon._id)}
                                       className='flex-1 p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-lg cursor-pointer transition text-center font-semibold'
                                    >
                                       <FaTrash className='inline mr-1' /> Delete
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* User Detail Modal */}
         {selectedUser && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                  <div className='p-6'>
                     <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-semibold text-gray-900'>User Details</h2>
                        <button
                           onClick={() => setSelectedUser(null)}
                           className='p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer'
                        >
                           <FaTimes />
                        </button>
                     </div>

                     <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Name</p>
                              <p className='text-gray-900 font-semibold'>{selectedUser.name}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Role</p>
                              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                 selectedUser.role === 'restaurant_owner' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                 }`}>
                                 {selectedUser.role}
                              </span>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Email</p>
                              <p className='text-gray-900'>{selectedUser.email}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Phone</p>
                              <p className='text-gray-900'>{selectedUser.phone || 'N/A'}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>User ID</p>
                              <p className='text-gray-900 text-xs'>{selectedUser._id}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Created At</p>
                              <p className='text-gray-900'>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                     </div>

                     <div className='mt-6 flex gap-3'>
                        <button
                           onClick={() => setSelectedUser(null)}
                           className='flex-1 bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition'
                        >
                           Close
                        </button>
                        <button
                           onClick={() => {
                              handleDeleteUser(selectedUser._id);
                              setSelectedUser(null);
                           }}
                           className='flex-1 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition'
                        >
                           Delete User
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Restaurant Detail Modal */}
         {selectedRestaurant && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
                  <div className='p-6'>
                     <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-semibold text-gray-900'>Restaurant Details</h2>
                        <button
                           onClick={() => setSelectedRestaurant(null)}
                           className='p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer'
                        >
                           <FaTimes />
                        </button>
                     </div>

                     <img
                        src={selectedRestaurant.image}
                        alt={selectedRestaurant.name}
                        className='w-full h-64 object-cover rounded-xl mb-6'
                     />

                     <div className='space-y-4'>
                        <div>
                           <h3 className='text-2xl font-bold text-gray-900 mb-2'>{selectedRestaurant.name}</h3>
                           {selectedRestaurant.isVeg && (
                              <span className='inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full'>
                                 Pure Vegetarian
                              </span>
                           )}
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-1'>Address</p>
                           <p className='text-gray-900'>{selectedRestaurant.address}</p>
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-1'>Restaurant ID</p>
                           <p className='text-gray-900 text-xs'>{selectedRestaurant._id}</p>
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-1'>Owner ID</p>
                           <p className='text-gray-900 text-xs'>{selectedRestaurant.owner}</p>
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-1'>Created At</p>
                           <p className='text-gray-900'>{new Date(selectedRestaurant.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className='mt-6 flex gap-3'>
                        <button
                           onClick={() => setSelectedRestaurant(null)}
                           className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition cursor-pointer'
                        >
                           Close
                        </button>
                        <button
                           onClick={() => {
                              handleDeleteRestaurant(selectedRestaurant._id);
                              setSelectedRestaurant(null);
                           }}
                           className='flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
                        >
                           Delete Restaurant
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Order Detail Modal */}
         {selectedOrder && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
                  <div className='p-6'>
                     <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-semibold text-gray-900'>Order Details</h2>
                        <button
                           onClick={() => setSelectedOrder(null)}
                           className='p-2 hover:bg-gray-100 rounded-lg transition'
                        >
                           <FaTimes />
                        </button>
                     </div>

                     <div className='space-y-6'>
                        <div className='grid grid-cols-2 gap-4'>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Order ID</p>
                              <p className='text-gray-900 font-mono text-sm'>{selectedOrder._id}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Status</p>
                              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                 selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    selectedOrder.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-blue-100 text-blue-800'
                                 }`}>
                                 {selectedOrder.status}
                              </span>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Payment Method</p>
                              <p className='text-gray-900'>{selectedOrder.paymentMethod}</p>
                           </div>
                           <div>
                              <p className='text-sm font-medium text-gray-600 mb-1'>Total Amount</p>
                              <p className='text-gray-900 font-bold text-xl'>₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                           </div>
                        </div>

                        {selectedOrder.coupon && (
                           <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                              <p className='text-sm font-medium text-green-800 mb-1'>Coupon Applied</p>
                              <p className='text-green-900 font-bold'>{selectedOrder.coupon}</p>
                           </div>
                        )}

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-2'>Delivery Address</p>
                           <p className='text-gray-900'>{selectedOrder.deliveryAddress}</p>
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-3'>Order Items</p>
                           <div className='space-y-3'>
                              {selectedOrder.items?.map((item, index) => (
                                 <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                                    <div>
                                       <p className='font-semibold text-gray-900'>{item.menuItem?.title || 'Item'}</p>
                                       <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                                    </div>
                                    <p className='font-bold text-gray-900'>₹{(item.price * item.quantity).toFixed(2)}</p>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <p className='text-sm font-medium text-gray-600 mb-1'>Order Date</p>
                           <p className='text-gray-900'>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                     </div>

                     <div className='mt-6'>
                        <button
                           onClick={() => setSelectedOrder(null)}
                           className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition'
                        >
                           Close
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AdminDashboard;