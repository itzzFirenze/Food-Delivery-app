import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaSearch, FaShoppingCart } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
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

   const addToCart = async (itemId) => {
      try {
         setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
         }));

         await API.post('/cart/add', {
            menuItemId: itemId,
            quantity: 1
         });
      } catch (err) {
         console.error('Error adding to cart:', err);
         setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
               newCart[itemId] -= 1;
            } else {
               delete newCart[itemId];
            }
            return newCart;
         });
         toast.error('Failed to add item to cart. Please try again.');
      }
   };

   const removeFromCart = async (itemId) => {
      try {
         const currentQuantity = cart[itemId];

         setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
               newCart[itemId] -= 1;
            } else {
               delete newCart[itemId];
            }
            return newCart;
         });

         if (currentQuantity > 1) {
            await API.patch('/cart/update', {
               menuItemId: itemId,
               quantity: currentQuantity - 1
            });
         } else {
            await API.patch('/cart/update', {
               menuItemId: itemId,
               quantity: 0
            });
         }
      } catch (err) {
         console.error('Error removing from cart:', err);
         setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
         }));
         toast.error('Failed to remove item from cart. Please try again.');
      }
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
      <div className='min-h-screen bg-gray-50 md:py-0 py-12'>
         <Toaster position='top-center' reverseOrder={false} />
         {/* Hero Section */}
         <div className='relative bg-linear-to-br from-gray-200 to-gray-300 md:h-96 h-64'>
            <div
               className='absolute inset-0 bg-cover bg-center opacity-80'
               style={{ backgroundImage: `url(${restaurant.image})` }}
            />
            <div className='relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8'>
               <div className='bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl'>
                  <h1 className='md:text-4xl text-3xl font-bold text-gray-900 mb-2'>{restaurant.name}</h1>
                  <p className='md:text-lg text-md text-gray-500'>{restaurant.address}</p>
                  {/* Rating Badge */}
                  <div className='absolute top-8 right-8 bg-white rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2'>
                     <FaStar className='text-yellow-500 md:text-xl text-md' />
                     <span className='md:text-2xl text-lg font-bold text-gray-900'>{restaurant.rating || '4.1'}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Menu Section */}
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <h2 className='text-3xl font-semibold text-gray-900 mb-6'>Menu</h2>

            {/* Filters */}
            <div className='bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between'>
               <div className='flex gap-2 w-full md:w-auto'>
                  <button
                     onClick={() => setFilterVeg(!filterVeg)}
                     className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border-2 cursor-pointer transition-all flex-1 md:flex-initial justify-center ${filterVeg
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'
                        }`}
                  >
                     <div className='w-4 h-4 md:w-5 md:h-5 border-2 border-green-600 rounded flex items-center justify-center shrink-0'>
                        {filterVeg && <div className='w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-green-600 rounded-full' />}
                     </div>
                     <span className='font-medium text-xs md:text-base'>Veg</span>
                  </button>
                  <button
                     onClick={() => setFilterNonVeg(!filterNonVeg)}
                     className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-full border-2 cursor-pointer transition-all flex-1 md:flex-initial justify-center ${filterNonVeg
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-500'
                        }`}
                  >
                     <div className='w-4 h-4 md:w-5 md:h-5 border-2 border-red-500 rounded flex items-center justify-center shrink-0'>
                        {filterNonVeg && <div className='w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-red-500 rounded-full' />}
                     </div>
                     <span className='font-medium text-xs md:text-base'>Non-Veg</span>
                  </button>
               </div>
               {/* Search Bar */}
               <div className='relative w-full md:w-80'>
                  <div className='absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none'>
                     <FaSearch className='text-gray-400 text-xs md:text-base' />
                  </div>
                  <input
                     type='text'
                     placeholder='Search menu items...'
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className='w-full pl-9 pr-3 py-1.5 md:pl-11 md:pr-4 md:py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none'
                  />
               </div>
            </div>

            {/* Divider */}
            <div className='border-b border-gray-200 mb-6'></div>

            {/* Menu Items */}
            <div className='space-y-4 md:space-y-6'>
               {filteredMenu.length > 0 ? (
                  filteredMenu.map((item) => (
                     <div
                        key={item._id}
                        className='bg-white rounded-2xl md:rounded-3xl shadow-md hover:shadow-lg transition-shadow overflow-hidden'
                     >
                        {/* Changed flex-col to flex-row to keep everything in one line on mobile */}
                        <div className='flex flex-row'>

                           {/* Item Details */}
                           <div className='flex-1 p-3 md:p-8 flex flex-col justify-center'>
                              <div className='flex items-start gap-2 md:gap-3'>
                                 <div className={`w-4 h-4 md:w-6 md:h-6 border-2 rounded flex items-center justify-center mt-1 shrink-0 ${item.veg ? 'border-green-600' : 'border-red-500'
                                    }`}>
                                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-500'
                                       }`} />
                                 </div>
                                 <div className='flex-1'>
                                    <h3 className='text-base md:text-xl font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 md:line-clamp-none'>{item.title}</h3>
                                    <p className='text-sm md:text-lg font-bold text-gray-900 mb-0 md:mb-3'>₹{item.price}</p>
                                    {/* Added hidden md:block to hide description on mobile */}
                                    <p className='hidden md:block text-base text-gray-600 leading-relaxed'>{item.description}</p>
                                 </div>
                              </div>
                           </div>

                           {/* Item Image & Add Button */}
                           <div className='w-auto md:w-72 relative flex flex-col items-center justify-center p-3 md:p-4 shrink-0'>
                              <div className='w-28 h-28 md:w-44 md:h-44 bg-gray-50 md:bg-gray-100 rounded-xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-md'>
                                 {item.image ? (
                                    <img
                                       src={item.image}
                                       alt={item.title}
                                       className='w-full h-full object-cover'
                                    />
                                 ) : (
                                    <div className='w-full h-full flex items-center justify-center text-gray-400 text-xs md:text-sm'>
                                       No image
                                    </div>
                                 )}
                              </div>
                              <div className='-mt-4 md:-mt-6 z-10'>
                                 {cart[item._id] > 0 ? (
                                    <div className='flex items-center gap-0 md:gap-4 bg-blue-600 rounded-lg md:rounded-2xl shadow-md'>
                                       <button
                                          onClick={() => removeFromCart(item._id)}
                                          className='text-white font-bold text-sm md:text-lg px-2.5 py-1.5 md:px-5 md:py-2 hover:bg-blue-700 rounded-l-lg md:rounded-l-2xl transition-colors cursor-pointer'
                                       >
                                          -
                                       </button>
                                       <span className='text-white font-semibold text-sm md:text-lg min-w-6 md:min-w-4 text-center'>
                                          {cart[item._id]}
                                       </span>
                                       <button
                                          onClick={() => addToCart(item._id)}
                                          className='text-white font-bold text-sm md:text-lg px-2.5 py-1.5 md:px-5 md:py-2 hover:bg-blue-700 rounded-r-lg md:rounded-r-2xl transition-colors cursor-pointer'
                                       >
                                          +
                                       </button>
                                    </div>
                                 ) : (
                                    <button
                                       onClick={() => addToCart(item._id)}
                                       className='w-24 md:w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-lg py-1.5 md:py-2 px-4 md:px-6 rounded-lg md:rounded-2xl transition-colors shadow-md hover:shadow-lg cursor-pointer'
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
                  <div className='bg-white rounded-2xl md:rounded-3xl p-8 md:p-12 text-center'>
                     <div className='text-4xl md:text-5xl mb-3 md:mb-4'>🍽️</div>
                     <h3 className='text-lg md:text-xl font-semibold text-gray-700 mb-1 md:mb-2'>No items found</h3>
                     <p className='text-sm md:text-base text-gray-500'>Try adjusting your filters or search query</p>
                  </div>
               )}
            </div>
         </div>

         {/* Floating Cart Button */}
         <Link to='/cart'>
            {cartCount > 0 && (
               <div className='fixed md:bottom-8 bottom-16 right-8 z-50'>
                  <button className='bg-blue-600 hover:bg-blue-700 text-white rounded-full md:p-5 p-4 shadow-2xl transition-all hover:scale-110 relative group cursor-pointer'>
                     <FaShoppingCart className='md:text-2xl text-lg' />
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
         </Link>
      </div>
   );
};

export default RestaurantDetail;