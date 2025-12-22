import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaSearch, FaShoppingCart } from 'react-icons/fa';
import API from '../services/api';

const RestaurantDetail = () => {
   const { id } = useParams();
   const [restaurant, setRestaurant] = useState(null);
   const [menuItems, setMenuItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [filterVeg, setFilterVeg] = useState(false);
   const [filterNonVeg, setFilterNonVeg] = useState(false);
   const [cart, setCart] = useState({});

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const [restaurantRes, menuRes] = await Promise.all([
               API.get(`/restaurants/${id}`),
               API.get(`/restaurants/${id}/menu`)
            ]);

            setRestaurant(restaurantRes.data.data);
            setMenuItems(menuRes.data.data);
            setLoading(false);
         } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load restaurant details');
            setLoading(false);
         }
      };

      fetchData();
   }, [id]);

   const addToCart = (itemId) => {
      setCart(prev => ({
         ...prev,
         [itemId]: (prev[itemId] || 0) + 1
      }));
   };

   const removeFromCart = (itemId) => {
      setCart(prev => {
         const newCart = { ...prev };
         if (newCart[itemId] > 1) {
            newCart[itemId] -= 1;
         } else {
            delete newCart[itemId];
         }
         return newCart;
      });
   };

   const filteredMenu = menuItems.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterVeg && filterNonVeg) return matchesSearch;
      if (filterVeg) return matchesSearch && item.veg === true;
      if (filterNonVeg) return matchesSearch && item.veg === false;

      return matchesSearch;
   });

   if (loading) {
      return (
         <div className='flex justify-center items-center min-h-screen bg-gray-50'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
         </div>
      );
   }

   if (error || !restaurant) {
      return (
         <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
            <div className='text-center'>
               <div className='text-red-500 font-semibold text-lg mb-4'>{error || 'Restaurant not found'}</div>
               <button
                  onClick={() => window.location.reload()}
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition'
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
   const cartTotal = menuItems.reduce((total, item) => {
      return total + (cart[item._id] || 0) * item.price;
   }, 0);

   return (
      <div className='min-h-screen bg-gray-50'>
         {/* Hero Section */}
         <div className='relative bg-linear-to-br from-gray-200 to-gray-300 h-96'>
            <div
               className='absolute inset-0 bg-cover bg-center opacity-80'
               style={{ backgroundImage: `url(${restaurant.image})` }}
            />
            <div className='relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8'>
               <div className='bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl'>
                  <h1 className='text-4xl font-bold text-gray-900 mb-2'>{restaurant.name}</h1>
                  <p className='text-xl text-gray-600 mb-1'>{restaurant.cuisine}</p>
                  <p className='text-lg text-gray-500'>{restaurant.address}</p>

                  {/* Rating Badge */}
                  <div className='absolute top-8 right-8 bg-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2'>
                     <FaStar className='text-yellow-500 text-xl' />
                     <span className='text-2xl font-bold text-gray-900'>{restaurant.rating || '4.1'}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Menu Section */}
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <h2 className='text-3xl font-semibold text-gray-900 mb-6'>Menu</h2>

            {/* Filters */}
            <div className='bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between'>
               <div className='flex gap-3 flex-wrap'>
                  <button
                     onClick={() => setFilterVeg(!filterVeg)}
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition-all ${filterVeg
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
                        }`}
                  >
                     <div className='w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center'>
                        {filterVeg && <div className='w-2.5 h-2.5 bg-green-600 rounded-full' />}
                     </div>
                     <span className='font-medium'>Veg</span>
                  </button>

                  <button
                     onClick={() => setFilterNonVeg(!filterNonVeg)}
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 cursor-pointer transition-all ${filterNonVeg
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500'
                        }`}
                  >
                     <div className='w-5 h-5 border-2 border-red-500 rounded flex items-center justify-center'>
                        {filterNonVeg && <div className='w-2.5 h-2.5 bg-red-500 rounded-full' />}
                     </div>
                     <span className='font-medium'>Non-Veg</span>
                  </button>
               </div>

               {/* Search Bar */}
               <div className='relative w-full md:w-80'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                     <FaSearch className='text-gray-400' />
                  </div>
                  <input
                     type='text'
                     placeholder='Search menu items...'
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className='w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                  />
               </div>
            </div>

            {/* Divider */}
            <div className='border-b border-gray-200 mb-6'></div>

            {/* Menu Items */}
            <div className='space-y-6'>
               {filteredMenu.length > 0 ? (
                  filteredMenu.map((item) => (
                     <div
                        key={item._id}
                        className='bg-white rounded-3xl shadow-md hover:shadow-lg transition-shadow overflow-hidden'
                     >
                        <div className='flex flex-col md:flex-row'>
                           {/* Item Details */}
                           <div className='flex-1 p-8'>
                              <div className='flex items-start gap-3 mb-3'>
                                 <div className={`w-6 h-6 border-2 rounded flex items-center justify-center mt-1 ${item.veg ? 'border-green-600' : 'border-red-500'
                                    }`}>
                                    <div className={`w-3 h-3 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-500'
                                       }`} />
                                 </div>
                                 <div className='flex-1'>
                                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>{item.title}</h3>
                                    <p className='text-lg font-bold text-gray-900 mb-3'>₹{item.price}</p>
                                    <p className='text-gray-600 leading-relaxed'>{item.description}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Item Image & Add Button */}
                           <div className='md:w-72 relative flex flex-col items-center justify-center p-4'>
                              <div className='w-44 h-44 bg-gray-100 rounded-3xl overflow-hidden shadow-md'>
                                 {item.image ? (
                                    <img
                                       src={item.image}
                                       alt={item.title}
                                       className='w-full h-full object-cover'
                                    />
                                 ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400 text-sm'>
                                       No image
                                    </div>
                                 )}
                              </div>

                              <div className='-mt-6 z-10'>
                                 {cart[item._id] > 0 ? (
                                    <div className='flex items-center gap-4 bg-blue-600 rounded-2xl shadow-md'>
                                       <button
                                          onClick={() => removeFromCart(item._id)}
                                          className='text-white font-bold text-lg px-5 py-2 hover:bg-blue-700 rounded-l-2xl transition-colors cursor-pointer'
                                       >
                                          -
                                       </button>
                                       <span className='text-white font-semibold text-lg min-w-4 text-center'>
                                          {cart[item._id]}
                                       </span>
                                       <button
                                          onClick={() => addToCart(item._id)}
                                          className='text-white font-bold text-lg px-5 py-2 hover:bg-blue-700 rounded-r-2xl transition-colors cursor-pointer'
                                       >
                                          +
                                       </button>
                                    </div>
                                 ) : (
                                    <button
                                       onClick={() => addToCart(item._id)}
                                       className='w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-2 px-6 rounded-2xl transition-colors shadow-md hover:shadow-lg'
                                    >
                                       ADD
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className='bg-white rounded-3xl p-12 text-center'>
                     <div className='text-5xl mb-4'>🍽️</div>
                     <h3 className='text-xl font-semibold text-gray-700 mb-2'>No items found</h3>
                     <p className='text-gray-500'>Try adjusting your filters or search query</p>
                  </div>
               )}
            </div>
         </div>

         {/* Floating Cart Button */}
         {cartCount > 0 && (
            <div className='fixed bottom-8 right-8 z-50'>
               <button className='bg-blue-600 hover:bg-blue-700 text-white rounded-full p-5 shadow-2xl transition-all hover:scale-110 relative group'>
                  <FaShoppingCart className='text-2xl' />
                  <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center'>
                     {cartCount}
                  </span>
                  {/* Tooltip */}
                  <div className='absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                     {cartCount} items • ₹{cartTotal}
                  </div>
               </button>
            </div>
         )}
      </div>
   );
};

export default RestaurantDetail;