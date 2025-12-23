import React, { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import API from '../../services/api';

const CouponTab = () => {
   const [coupons, setCoupons] = useState([]);
   const [loading, setLoading] = useState(true);
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
      fetchCoupons();
   }, []);

   const fetchCoupons = async () => {
      try {
         const response = await API.get('/coupons');
         setCoupons(response.data.data || []);
      } catch (err) {
         console.error('Error fetching coupons:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleCouponSubmit = async (e) => {
      e.preventDefault();
      // ... (Validation logic)
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
         alert(err.response?.data?.message || 'Failed to save coupon');
      }
   };

   const handleDeleteCoupon = async (couponId) => {
      if (!window.confirm('Are you sure you want to delete this coupon?')) return;
      try {
         await API.delete(`/coupons/${couponId}`);
         alert('Coupon deleted successfully!');
         fetchCoupons();
      } catch (err) {
         alert(err.response?.data?.message || 'Failed to delete coupon');
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

   const resetCouponForm = () => {
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', expiryDate: '', usageLimit: '' });
      setIsEditingCoupon(false);
      setEditingCouponId(null);
      setShowCouponForm(false);
   };

   if (loading) return <div className="p-12 text-center">Loading coupons...</div>;

   return (
      <div className='space-y-6'>
         {!showCouponForm && (
            <button onClick={() => setShowCouponForm(true)} className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer'>
               <FaPlus /> Add New Coupon
            </button>
         )}

         {showCouponForm && (
            <div className='bg-white rounded-2xl shadow-sm p-6'>
               <h2 className='text-2xl font-semibold mb-6'>{isEditingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
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
   );
};

export default CouponTab;