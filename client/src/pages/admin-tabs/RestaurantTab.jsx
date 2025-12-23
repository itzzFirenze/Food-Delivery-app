import React, { useEffect, useState } from 'react';
import { FaEye, FaTrash, FaTimes } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import DeleteModal from '../../components/DeleteModal';
import API from '../../services/api';

const RestaurantTab = () => {
   const [restaurants, setRestaurants] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedRestaurant, setSelectedRestaurant] = useState(null);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [restaurantToDelete, setRestaurantToDelete] = useState(null);
   const [isDeleting, setIsDeleting] = useState(false);

   useEffect(() => {
      fetchRestaurants();
   }, []);

   const fetchRestaurants = async () => {
      try {
         const response = await API.get('/restaurants');
         setRestaurants(response.data.data || []);
      } catch (err) {
         console.error('Error fetching restaurants:', err);
      } finally {
         setLoading(false);
      }
   };

   const openDeleteModal = (restaurant) => {
      setRestaurantToDelete(restaurant);
      setShowDeleteModal(true);
   };

   const handleDeleteRestaurant = async () => {
      if (!restaurantToDelete) return;
      try {
         await API.delete(`/restaurants/${restaurantToDelete?._id}`);
         toast.success('Restaurant deleted successfully!');
         fetchRestaurants();
         setSelectedRestaurant(null);
         setShowDeleteModal(false);
         setRestaurantToDelete(null);
      } catch (err) {
         toast.error(err.response?.data?.message || 'Failed to delete restaurant');
      } finally {
         setIsDeleting(false);
      }
   };

   if (loading) return <div className="p-12 text-center">Loading restaurants...</div>;

   return (
      <div className='bg-white rounded-2xl shadow-sm p-6'>
         <Toaster position='top-center' reverseOrder={false} />
         <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Restaurants ({restaurants.length})</h2>

         {restaurants.length === 0 ? (
            <div className='text-center py-12 text-gray-600'>No restaurants found</div>
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
                              className='flex-1 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer font-semibold'>
                              <FaEye className="inline mr-1" /> View
                           </button>
                           <button
                              onClick={() => openDeleteModal(restaurant)}
                              className='flex-1 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer font-semibold'>
                              <FaTrash className="inline mr-1" /> Delete
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Restaurant Detail Modal */}
         {selectedRestaurant && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto'>
                  <div className='flex justify-between mb-4'>
                     <h2 className='text-2xl font-bold'>Restaurant Details</h2>
                     <button onClick={() => setSelectedRestaurant(null)} className='cursor-pointer'><FaTimes /></button>
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
                        <p className='text-gray-900 text-sm'>{selectedRestaurant._id}</p>
                     </div>

                     <div>
                        <p className='text-sm font-medium text-gray-600 mb-1'>Owner ID</p>
                        <p className='text-gray-900 text-sm'>{selectedRestaurant.owner}</p>
                     </div>

                     <div>
                        <p className='text-sm font-medium text-gray-600 mb-1'>Created At</p>
                        <p className='text-gray-900'>{new Date(selectedRestaurant.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className='mt-6 flex gap-3'>
                     <button
                        onClick={() => setSelectedRestaurant(null)}
                        className='flex-1 bg-gray-200 py-3 rounded-lg cursor-pointer font-semibold'>
                        Close
                     </button>
                     <button
                        onClick={() => openDeleteModal(selectedRestaurant)}
                        className='flex-1 bg-red-600 text-white py-3 rounded-lg cursor-pointer font-semibold'>
                        Delete Restaurant
                     </button>
                  </div>
               </div>
            </div>
         )}

         <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => {
               setShowDeleteModal(false);
               setRestaurantToDelete(null);
            }}
            onConfirm={handleDeleteRestaurant}
            title='Delete Restaurant'
            message={`Are you sure you want to delete ${restaurantToDelete?.name}? This action cannot be undone`}
            confirmText='Delete'
            cancelText='Cancel'
            isLoading={isDeleting}
         />

      </div>
   );
};

export default RestaurantTab;