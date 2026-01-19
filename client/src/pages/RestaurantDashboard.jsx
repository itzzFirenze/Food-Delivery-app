import React, { useEffect, useState, Fragment } from 'react';
import { FaStore, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUtensils } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';

import DeleteModal from '../components/DeleteModal';
import API from '../services/api';

const RestaurantDashboard = () => {
   const [restaurant, setRestaurant] = useState(null);
   const [menuItems, setMenuItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [showRestaurantDeleteModal, setShowRestaurantDeleteModal] = useState(false);
   const [showMenuDeleteModal, setShowMenuDeleteModal] = useState(false);
   const [IsDeletingRestaurant, setIsDeletingRestaurant] = useState(false);
   const [IsDeletingMenu, setIsDeletingMenu] = useState(false);
   const [restaurantToDelete, setRestaurantToDelete] = useState(null);
   const [menuToDelete, setMenuToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState('restaurant');

   // Restaurant form states
   const [restaurantForm, setRestaurantForm] = useState({
      name: '',
      address: '',
      image: '',
      isVeg: false
   });
   const [showRestaurantModal, setShowRestaurantModal] = useState(false);
   const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);

   // Menu item form states
   const [menuForm, setMenuForm] = useState({
      title: '',
      description: '',
      price: '',
      image: '',
      category: '',
      veg: true
   });
   const [isEditingMenu, setIsEditingMenu] = useState(false);
   const [editingMenuId, setEditingMenuId] = useState(null);
   const [showMenuModal, setShowMenuModal] = useState(false);

   const UPLOADCARE_PUB_KEY = "0024e9d244ea0f32b536";

   useEffect(() => {
      fetchRestaurantData();
   }, []);

   const fetchRestaurantData = async () => {
      try {
         setLoading(true);
         const restaurantsResponse = await API.get('/restaurants');
         const allRestaurants = restaurantsResponse.data.data || [];
         const userResponse = await API.get('/users/me');
         const userId = userResponse.data.data._id;
         const ownedRestaurant = allRestaurants.find(r => r.owner === userId);

         if (ownedRestaurant) {
            setRestaurant(ownedRestaurant);
            setRestaurantForm({
               name: ownedRestaurant.name,
               address: ownedRestaurant.address,
               image: ownedRestaurant.image,
               isVeg: ownedRestaurant.isVeg || false
            });
            const menuResponse = await API.get(`/restaurants/${ownedRestaurant._id}/menu`);
            setMenuItems(menuResponse.data.data || []);
         } else {
            setRestaurant(null);
            // CHANGED: Removed the auto-open modal logic here
         }
         setError(null);
      } catch (err) {
         console.error('Error fetching restaurant data:', err);
         setError('Failed to load restaurant data');
      } finally {
         setLoading(false);
      }
   };

   // NEW: Handler for manually clicking the create button
   const handleCreateRestaurantClick = () => {
      setRestaurantForm({
         name: '',
         address: '',
         image: '',
         isVeg: false
      });
      setIsCreatingRestaurant(true);
      setShowRestaurantModal(true);
   };

   const openRestaurantDeleteModal = (restaurant) => {
      setRestaurantToDelete(restaurant);
      setShowRestaurantDeleteModal(true);
   };

   const openMenuDeleteModal = (menu) => {
      setMenuToDelete(menu);
      setShowMenuDeleteModal(true);
   };

   const handleRestaurantSubmit = async (e) => {
      e.preventDefault();
      if (!restaurantForm.name || !restaurantForm.address || !restaurantForm.image) {
         toast.error('Please fill in all required fields and upload an image');
         return;
      }

      try {
         if (restaurant) {
            await API.patch(`/restaurants/${restaurant._id}`, restaurantForm);
            toast.success('Restaurant updated successfully!');
         } else {
            await API.post('/restaurants', restaurantForm);
            toast.success('Restaurant created successfully!');
         }
         setShowRestaurantModal(false);
         setIsCreatingRestaurant(false);
         fetchRestaurantData();
      } catch (err) {
         console.error('Error saving restaurant:', err);
         toast.error(err.response?.data?.message || 'Failed to save restaurant');
      }
   };

   const handleDeleteRestaurant = async () => {
      if (!restaurantToDelete) return;

      try {
         await API.delete(`/restaurants/${restaurantToDelete._id}`);
         toast.success('Restaurant deleted successfully!');
         setRestaurant(null);
         setMenuItems([]);
         setShowRestaurantDeleteModal(false);
         setRestaurantToDelete(null);
         setIsCreatingRestaurant(true); 
         // Note: We don't auto-open modal here anymore, letting the user click the button
      } catch (err) {
         console.error('Error deleting restaurant:', err);
         toast.error(err.response?.data?.message || 'Failed to delete restaurant');
      } finally {
         setIsDeletingRestaurant(false);
      }
   };

   const handleMenuSubmit = async (e) => {
      e.preventDefault();
      if (!menuForm.title || !menuForm.description || !menuForm.price || !menuForm.image || !menuForm.category) {
         toast.error('Please fill in all required fields and upload an image');
         return;
      }

      try {
         const menuData = {
            ...menuForm,
            price: parseFloat(menuForm.price),
            restaurantId: restaurant._id
         };

         if (isEditingMenu && editingMenuId) {
            await API.patch(`/restaurants/${restaurant._id}/menu/${editingMenuId}`, menuData);
            toast.success('Menu item updated successfully!');
         } else {
            await API.post(`/restaurants/${restaurant._id}/menu`, menuData);
            toast.success('Menu item created successfully!');
         }
         resetMenuForm();
         fetchRestaurantData();
      } catch (err) {
         console.error('Error saving menu item:', err);
         toast.error(err.response?.data?.message || 'Failed to save menu item');
      }
   };

   const handleEditMenuItem = (item) => {
      setMenuForm({
         title: item.title,
         description: item.description,
         price: item.price.toString(),
         image: item.image,
         category: item.category,
         veg: item.veg
      });
      setIsEditingMenu(true);
      setEditingMenuId(item._id);
      setShowMenuModal(true);
   };

   const handleDeleteMenuItem = async () => {
      if (!menuToDelete) return;

      try {
         setIsDeletingMenu(true);
         await API.delete(`/restaurants/${restaurant._id}/menu/${menuToDelete._id}`);
         toast.success('Menu item deleted successfully!');
         fetchRestaurantData();
         setShowMenuDeleteModal(false);
         setMenuToDelete(null);
      } catch (err) {
         console.error('Error deleting menu item:', err);
         toast.error(err.response?.data?.message || 'Failed to delete menu item');
      } finally {
         setIsDeletingMenu(false);
      }
   };

   const resetMenuForm = () => {
      setMenuForm({
         title: '',
         description: '',
         price: '',
         image: '',
         category: '',
         veg: true
      });
      setIsEditingMenu(false);
      setEditingMenuId(null);
      setShowMenuModal(false);
   };

   const resetRestaurantModal = () => {
      if (restaurant) {
         setRestaurantForm({
            name: restaurant.name,
            address: restaurant.address,
            image: restaurant.image,
            isVeg: restaurant.isVeg || false
         });
      }
      setShowRestaurantModal(false);
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
                  onClick={fetchRestaurantData}
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
         <Toaster position='top-center' reverseOrder={false} />

         <div className='max-w-7xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>Restaurant Dashboard</h1>
               <p className='text-gray-600'>Manage your restaurant and menu items</p>
            </div>

            {/* Tabs - Only show if restaurant exists */}
            {restaurant && (
               <div className='flex gap-4 mb-6'>
                  <button
                     onClick={() => setActiveTab('restaurant')}
                     className={`px-6 py-3 cursor-pointer rounded-lg font-semibold transition ${activeTab === 'restaurant'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                  >
                     <FaStore className='inline mr-2' />
                     Restaurant Info
                  </button>
                  <button
                     onClick={() => setActiveTab('menu')}
                     className={`px-6 py-3 rounded-lg cursor-pointer font-semibold transition ${activeTab === 'menu'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                  >
                     <FaUtensils className='inline mr-2' />
                     Menu Items
                  </button>
               </div>
            )}

            {/* Restaurant Section */}
            {activeTab === 'restaurant' && (
               <div className='bg-white rounded-2xl shadow-sm p-6'>
                  {restaurant ? (
                     <div>
                        <div className='flex items-center justify-between mb-6'>
                           <h2 className='text-2xl font-semibold text-gray-900'>Your Restaurant</h2>
                           <div className='flex gap-3'>
                              <button
                                 onClick={() => setShowRestaurantModal(true)}
                                 className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer'
                              >
                                 <FaEdit /> Edit
                              </button>
                              <button
                                 onClick={() => openRestaurantDeleteModal(restaurant)}
                                 className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer'
                              >
                                 <FaTrash /> Delete
                              </button>
                           </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                           <div>
                              <img
                                 src={restaurant.image}
                                 alt={restaurant.name}
                                 className='w-full h-64 object-cover rounded-xl mb-4'
                              />
                           </div>
                           <div className='space-y-4'>
                              <div>
                                 <h3 className='text-xl font-bold text-gray-900'>{restaurant.name}</h3>
                                 {restaurant.isVeg && (
                                    <span className='inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full'>
                                       Pure Veg
                                    </span>
                                 )}
                              </div>
                              <div>
                                 <p className='text-sm font-medium text-gray-600 mb-1'>Address</p>
                                 <p className='text-gray-900'>{restaurant.address}</p>
                              </div>
                              <div>
                                 <p className='text-sm font-medium text-gray-600 mb-1'>Menu Items</p>
                                 <p className='text-gray-900 text-2xl font-bold'>{menuItems.length}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     // CHANGED: Button to Create Restaurant if none exists
                     <div className='text-center py-12'>
                        <div className='text-6xl mb-4'>🏪</div>
                        <h2 className='text-2xl font-bold text-gray-900 mb-2'>No Restaurant Found</h2>
                        <p className='text-gray-600 mb-6'>You haven't set up your restaurant yet. Create one to start selling!</p>
                        <button
                           onClick={handleCreateRestaurantClick}
                           className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition shadow-lg flex items-center gap-2 mx-auto cursor-pointer'
                        >
                           <FaPlus /> Create Restaurant
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* Menu Section */}
            {activeTab === 'menu' && restaurant && (
               <div className='space-y-6'>
                  {/* Add Menu Button */}
                  <button
                     onClick={() => setShowMenuModal(true)}
                     className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer'
                  >
                     <FaPlus /> Add New Menu Item
                  </button>

                  {/* Menu Items List */}
                  <div className='bg-white rounded-2xl shadow-sm p-6'>
                     <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Menu Items ({menuItems.length})</h2>
                     {menuItems.length === 0 ? (
                        <div className='text-center py-12'>
                           <div className='text-6xl mb-4'>🍽️</div>
                           <p className='text-gray-600'>No menu items yet. Add your first item!</p>
                        </div>
                     ) : (
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                           {menuItems.map((item) => (
                              <div key={item._id} className='border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition'>
                                 <img
                                    src={item.image}
                                    alt={item.title}
                                    className='w-full h-36 object-cover'
                                 />
                                 <div className='p-4'>
                                    <div className='flex items-start justify-between mb-2'>
                                       <h3 className='font-semibold text-gray-900 text-lg'>{item.title}</h3>
                                       <div className={`w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 ${item.veg ? 'border-green-600' : 'border-red-500'
                                          }`}>
                                          <div className={`w-2.5 h-2.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-500'
                                             }`} />
                                       </div>
                                    </div>
                                    <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{item.description}</p>
                                    <div className='flex items-center justify-between'>
                                       <p className='text-xl font-bold text-gray-900'>₹{item.price}</p>
                                       <div className='flex gap-2'>
                                          <button
                                             onClick={() => handleEditMenuItem(item)}
                                             className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer'
                                          >
                                             <FaEdit />
                                          </button>
                                          <button
                                             onClick={() => openMenuDeleteModal(item)}
                                             className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer'
                                          >
                                             <FaTrash />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

            )}
            <DeleteModal
               isOpen={showRestaurantDeleteModal}
               onClose={() => {
                  setShowRestaurantDeleteModal(false);
                  setRestaurantToDelete(null);
               }}
               onConfirm={handleDeleteRestaurant}
               title='Delete Restaurant'
               message={`Are you sure you want to delete restaurant "${restaurantToDelete?.name}"? This action cannot be undone.`}
               confirmText='Delete'
               cancelText='Cancel'
               isLoading={IsDeletingRestaurant}
            />
         </div>

         <DeleteModal
            isOpen={showMenuDeleteModal}
            onClose={() => {
               setShowMenuDeleteModal(false);
               setMenuToDelete(null);
            }}
            onConfirm={handleDeleteMenuItem}
            title='Delete Menu Item'
            message={`Are you sure you want to delete "${menuToDelete?.title}"? This action cannot be undone.`}
            confirmText='Delete'
            cancelText='Cancel'
            isLoading={IsDeletingMenu}
         />

         {/* Restaurant Modal */}
         <Transition appear show={showRestaurantModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={resetRestaurantModal}>
               <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
               >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
               </Transition.Child>

               <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                     <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                     >
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                           <Dialog.Title
                              as="h3"
                              className="text-2xl font-semibold leading-6 text-gray-900 mb-6"
                           >
                              {restaurant ? 'Edit Restaurant' : 'Create Your Restaurant'}
                           </Dialog.Title>

                           <div className='space-y-4'>
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Restaurant Name *
                                 </label>
                                 <input
                                    type='text'
                                    value={restaurantForm.name}
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 />
                              </div>
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Address *
                                 </label>
                                 <input
                                    type='text'
                                    value={restaurantForm.address}
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 />
                              </div>

                              {/* --- RESTAURANT IMAGE UPLOADER --- */}
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Restaurant Image *
                                 </label>
                                 <div className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50">
                                    <FileUploaderRegular
                                       sourceList="local, url, camera"
                                       classNameUploader="uc-light"
                                       pubkey={UPLOADCARE_PUB_KEY}
                                       imgOnly={true}
                                       onFileUploadSuccess={(info) => {
                                          setRestaurantForm({ ...restaurantForm, image: info.cdnUrl });
                                          toast.success('Image uploaded!');
                                       }}
                                    />
                                    {/* Show preview if image exists */}
                                    {restaurantForm.image && (
                                       <div className="mt-2">
                                          <p className="text-xs text-green-600 mb-1">Current Image:</p>
                                          <img src={restaurantForm.image} alt="Preview" className="h-20 w-auto rounded border" />
                                       </div>
                                    )}
                                 </div>
                              </div>
                              {/* ---------------------------------- */}

                              <div className='flex items-center gap-3'>
                                 <input
                                    type='checkbox'
                                    id='isVeg'
                                    checked={restaurantForm.isVeg}
                                    onChange={(e) => setRestaurantForm({ ...restaurantForm, isVeg: e.target.checked })}
                                    className='w-4 h-4 text-blue-600 rounded cursor-pointer'
                                 />
                                 <label htmlFor='isVeg' className='text-sm font-medium text-gray-700'>
                                    Pure Vegetarian Restaurant
                                 </label>
                              </div>
                              <div className='flex gap-3 pt-4'>
                                 <button
                                    onClick={handleRestaurantSubmit}
                                    className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
                                 >
                                    <FaSave /> {restaurant ? 'Update Restaurant' : 'Create Restaurant'}
                                 </button>
                                 {restaurant && (
                                    <button
                                       onClick={resetRestaurantModal}
                                       className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition cursor-pointer'
                                    >
                                       <FaTimes /> Cancel
                                    </button>
                                 )}
                              </div>
                           </div>
                        </Dialog.Panel>
                     </Transition.Child>
                  </div>
               </div>
            </Dialog>
         </Transition>

         {/* Menu Item Modal */}
         <Transition appear show={showMenuModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={resetMenuForm}>
               <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
               >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
               </Transition.Child>

               <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                     <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                     >
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                           <Dialog.Title
                              as="h3"
                              className="text-2xl font-semibold leading-6 text-gray-900 mb-6"
                           >
                              {isEditingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
                           </Dialog.Title>

                           <div className='space-y-4'>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                       Item Name *
                                    </label>
                                    <input
                                       type='text'
                                       value={menuForm.title}
                                       onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                                       className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                       required
                                    />
                                 </div>
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                       Category *
                                    </label>
                                    <select
                                       value={menuForm.category}
                                       onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                                       className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                       required
                                    >
                                       <option value="">Select Category</option>
                                       <option value="Starters">Starters</option>
                                       <option value="Main Course">Main Course</option>
                                       <option value="Beverages">Beverages</option>
                                       <option value="Desserts">Desserts</option>
                                    </select>
                                 </div>
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                       Price (₹) *
                                    </label>
                                    <input
                                       type='number'
                                       step='0.01'
                                       value={menuForm.price}
                                       onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                                       className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                       required
                                    />
                                 </div>

                                 {/* --- MENU IMAGE UPLOADER --- */}
                                 <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                       Image *
                                    </label>
                                    <div className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50">
                                       <FileUploaderRegular
                                          sourceList="local, url, camera"
                                          classNameUploader="uc-light"
                                          pubkey={UPLOADCARE_PUB_KEY}
                                          imgOnly={true}
                                          onFileUploadSuccess={(info) => {
                                             setMenuForm({ ...menuForm, image: info.cdnUrl });
                                             toast.success('Image uploaded!');
                                          }}
                                       />
                                       {/* Show preview if image exists */}
                                       {menuForm.image && (
                                          <div className="mt-2">
                                             <p className="text-xs text-green-600 mb-1">Current Image:</p>
                                             <img src={menuForm.image} alt="Preview" className="h-20 w-auto rounded border" />
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 {/* --------------------------- */}
                              </div>
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Description *
                                 </label>
                                 <textarea
                                    value={menuForm.description}
                                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                                    rows={3}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 />
                              </div>
                              <div className='flex items-center gap-3'>
                                 <input
                                    type='checkbox'
                                    id='veg'
                                    checked={menuForm.veg}
                                    onChange={(e) => setMenuForm({ ...menuForm, veg: e.target.checked })}
                                    className='w-4 h-4 text-blue-600 rounded cursor-pointer'
                                 />
                                 <label htmlFor='veg' className='text-sm font-medium text-gray-700'>
                                    Vegetarian Item
                                 </label>
                              </div>
                              <div className='flex gap-3 pt-4'>
                                 <button
                                    onClick={handleMenuSubmit}
                                    className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
                                 >
                                    <FaSave /> {isEditingMenu ? 'Update Item' : 'Add Item'}
                                 </button>
                                 <button
                                    onClick={resetMenuForm}
                                    className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition cursor-pointer'
                                 >
                                    <FaTimes /> Cancel
                                 </button>
                              </div>
                           </div>
                        </Dialog.Panel>
                     </Transition.Child>
                  </div>
               </div>
            </Dialog>
         </Transition>
      </div>
   );
};

export default RestaurantDashboard;