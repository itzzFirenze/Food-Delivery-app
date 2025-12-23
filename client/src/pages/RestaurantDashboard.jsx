import React, { useEffect, useState } from 'react';
import { FaStore, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUtensils } from 'react-icons/fa';
import API from '../services/api';

const RestaurantDashboard = () => {
   const [restaurant, setRestaurant] = useState(null);
   const [menuItems, setMenuItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('restaurant');

   // Restaurant form states
   const [restaurantForm, setRestaurantForm] = useState({
      name: '',
      address: '',
      image: '',
      isVeg: false
   });
   const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
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
   const [showMenuForm, setShowMenuForm] = useState(false);

   useEffect(() => {
      fetchRestaurantData();
   }, []);

   const fetchRestaurantData = async () => {
      try {
         setLoading(true);

         // Fetch restaurant owned by current user
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

            // Fetch menu items for this restaurant
            const menuResponse = await API.get(`/restaurants/${ownedRestaurant._id}/menu`);
            setMenuItems(menuResponse.data.data || []);
         } else {
            setRestaurant(null);
            setIsCreatingRestaurant(true);
         }

         setError(null);
      } catch (err) {
         console.error('Error fetching restaurant data:', err);
         setError('Failed to load restaurant data');
      } finally {
         setLoading(false);
      }
   };

   const handleRestaurantSubmit = async (e) => {
      e.preventDefault();

      if (!restaurantForm.name || !restaurantForm.address || !restaurantForm.image) {
         alert('Please fill in all required fields');
         return;
      }

      try {
         if (restaurant) {
            // Update existing restaurant
            await API.patch(`/restaurants/${restaurant._id}`, restaurantForm);
            alert('Restaurant updated successfully!');
         } else {
            // Create new restaurant
            await API.post('/restaurants', restaurantForm);
            alert('Restaurant created successfully!');
         }

         setIsEditingRestaurant(false);
         setIsCreatingRestaurant(false);
         fetchRestaurantData();
      } catch (err) {
         console.error('Error saving restaurant:', err);
         alert(err.response?.data?.message || 'Failed to save restaurant');
      }
   };

   const handleDeleteRestaurant = async () => {
      if (!window.confirm('Are you sure you want to delete your restaurant? This will also delete all menu items.')) {
         return;
      }

      try {
         await API.delete(`/restaurants/${restaurant._id}`);
         alert('Restaurant deleted successfully!');
         setRestaurant(null);
         setMenuItems([]);
         setIsCreatingRestaurant(true);
      } catch (err) {
         console.error('Error deleting restaurant:', err);
         alert(err.response?.data?.message || 'Failed to delete restaurant');
      }
   };

   const handleMenuSubmit = async (e) => {
      e.preventDefault();

      if (!menuForm.title || !menuForm.description || !menuForm.price || !menuForm.image || !menuForm.category) {
         alert('Please fill in all required fields');
         return;
      }

      try {
         const menuData = {
            ...menuForm,
            price: parseFloat(menuForm.price),
            restaurantId: restaurant._id
         };

         if (isEditingMenu && editingMenuId) {
            // Update existing menu item
            await API.patch(`/restaurants/${restaurant._id}/menu/${editingMenuId}`, menuData);
            alert('Menu item updated successfully!');
         } else {
            // Create new menu item
            await API.post(`/restaurants/${restaurant._id}/menu`, menuData);
            alert('Menu item created successfully!');
         }

         resetMenuForm();
         fetchRestaurantData();
      } catch (err) {
         console.error('Error saving menu item:', err);
         alert(err.response?.data?.message || 'Failed to save menu item');
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
      setShowMenuForm(true);
   };

   const handleDeleteMenuItem = async (itemId) => {
      if (!window.confirm('Are you sure you want to delete this menu item?')) {
         return;
      }

      try {
         await API.delete(`/restaurants/${restaurant._id}/menu/${itemId}`);
         alert('Menu item deleted successfully!');
         fetchRestaurantData();
      } catch (err) {
         console.error('Error deleting menu item:', err);
         alert(err.response?.data?.message || 'Failed to delete menu item');
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
      setShowMenuForm(false);
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
         <div className='max-w-7xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>Restaurant Dashboard</h1>
               <p className='text-gray-600'>Manage your restaurant and menu items</p>
            </div>

            {/* Tabs */}
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
                  {restaurant && !isEditingRestaurant ? (
                     <div>
                        <div className='flex items-center justify-between mb-6'>
                           <h2 className='text-2xl font-semibold text-gray-900'>Your Restaurant</h2>
                           <div className='flex gap-3'>
                              <button
                                 onClick={() => setIsEditingRestaurant(true)}
                                 className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition'
                              >
                                 <FaEdit /> Edit
                              </button>
                              <button
                                 onClick={handleDeleteRestaurant}
                                 className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition'
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
                     <div>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                           {restaurant ? 'Edit Restaurant' : 'Create Your Restaurant'}
                        </h2>

                        <form onSubmit={handleRestaurantSubmit} className='space-y-4'>
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

                           <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                 Image URL *
                              </label>
                              <input
                                 type='text'
                                 value={restaurantForm.image}
                                 onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                                 className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                 required
                              />
                           </div>

                           <div className='flex items-center gap-3'>
                              <input
                                 type='checkbox'
                                 id='isVeg'
                                 checked={restaurantForm.isVeg}
                                 onChange={(e) => setRestaurantForm({ ...restaurantForm, isVeg: e.target.checked })}
                                 className='w-4 h-4 text-blue-600 rounded'
                              />
                              <label htmlFor='isVeg' className='text-sm font-medium text-gray-700'>
                                 Pure Vegetarian Restaurant
                              </label>
                           </div>

                           <div className='flex gap-3 pt-4'>
                              <button
                                 type='submit'
                                 className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
                              >
                                 <FaSave /> {restaurant ? 'Update Restaurant' : 'Create Restaurant'}
                              </button>
                              {restaurant && (
                                 <button
                                    type='button'
                                    onClick={() => {
                                       setIsEditingRestaurant(false);
                                       setRestaurantForm({
                                          name: restaurant.name,
                                          address: restaurant.address,
                                          image: restaurant.image,
                                          isVeg: restaurant.isVeg || false
                                       });
                                    }}
                                    className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition'
                                 >
                                    <FaTimes /> Cancel
                                 </button>
                              )}
                           </div>
                        </form>
                     </div>
                  )}
               </div>
            )}

            {/* Menu Section */}
            {activeTab === 'menu' && restaurant && (
               <div className='space-y-6'>
                  {/* Add Menu Button */}
                  {!showMenuForm && (
                     <button
                        onClick={() => setShowMenuForm(true)}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer'
                     >
                        <FaPlus /> Add New Menu Item
                     </button>
                  )}

                  {/* Menu Form */}
                  {showMenuForm && (
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                           {isEditingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
                        </h2>

                        <form onSubmit={handleMenuSubmit} className='space-y-4'>
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
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Image URL *
                                 </label>
                                 <input
                                    type='text'
                                    value={menuForm.image}
                                    onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                    required
                                 />
                              </div>
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
                                 type='submit'
                                 className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
                              >
                                 <FaSave /> {isEditingMenu ? 'Update Item' : 'Add Item'}
                              </button>
                              <button
                                 type='button'
                                 onClick={resetMenuForm}
                                 className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition cursor-pointer'
                              >
                                 <FaTimes /> Cancel
                              </button>
                           </div>
                        </form>
                     </div>
                  )}

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
                                             onClick={() => handleDeleteMenuItem(item._id)}
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
         </div>
      </div>
   );
};

export default RestaurantDashboard;