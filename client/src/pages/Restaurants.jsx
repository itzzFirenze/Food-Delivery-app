import React, { useEffect, useState } from 'react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import { FaFilter, FaSearch, FaLeaf, FaTimes } from 'react-icons/fa'; // Added FaLeaf for Veg, FaTimes for clear

const Restaurants = () => {
   const [restaurants, setRestaurants] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [isVegOnly, setIsVegOnly] = useState(false);
   const [showFilters, setShowFilters] = useState(false);

   useEffect(() => {
      const fetchRestaurants = async () => {
         try {
            const { data } = await API.get('/restaurants');
            setRestaurants(data.data);
            setLoading(false);
         } catch (error) {
            console.error("Error fetching restaurants", error);
            setError("Failed to load restaurants");
            setLoading(false);
         }
      };
      fetchRestaurants();
   }, []);

   // Filter restaurants based on search and veg filter
   const filteredRestaurants = restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !isVegOnly || restaurant.isVeg === true;
      return matchesSearch && matchesVeg;
   });

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
                  onClick={() => window.location.reload()}
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
         
         {/* Modern Sticky Header & Filter Section */}
         <div className='bg-white shadow-sm sticky top-16 z-30 border-b border-gray-100'>
            <div className='max-w-7xl mx-auto px-4 py-4'>
               
               {/* Top Row: Search and Primary Toggles */}
               <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  
                  {/* Search Bar - Expanded and Pill Shaped */}
                  <div className='relative w-full md:max-w-md'>
                     <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <FaSearch className='text-gray-400' />
                     </div>
                     <input
                        type='text'
                        placeholder='Search for restaurant, cuisine...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent text-gray-900 text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none'
                     />
                     {searchQuery && (
                        <button 
                           onClick={() => setSearchQuery('')}
                           className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600'
                        >
                           <FaTimes />
                        </button>
                     )}
                  </div>

                  {/* Filter Buttons Group */}
                  <div className='flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar'>
                     
                     {/* Veg Toggle Pill */}
                     <button
                        onClick={() => setIsVegOnly(!isVegOnly)}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                           isVegOnly 
                              ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                     >
                        <FaLeaf className={isVegOnly ? 'text-green-600' : 'text-gray-400'} />
                        Pure Veg
                     </button>

                     {/* Filters Button */}
                     {/* <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                           showFilters 
                              ? 'bg-blue-50 border-blue-500 text-blue-700' 
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                     >
                        <FaFilter className={showFilters ? 'text-blue-500' : 'text-gray-500'} />
                        Filters
                     </button> */}
                  </div>
               </div>

               {/* Expanded Filter Panel */}
               {showFilters && (
                  <div className='mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200'>
                     <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Sort & Filter</h3>
                     <div className='flex flex-wrap gap-2'>
                        {['Rating 4.0+', 'Fast Delivery', 'Open Now', 'Offers'].map((filter) => (
                           <button 
                              key={filter}
                              className='px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-gray-400 hover:bg-gray-50 transition'
                           >
                              {filter}
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Results Counter */}
         <div className='max-w-7xl mx-auto px-4 pt-6 pb-2'>
            <h2 className='text-xl font-bold text-gray-800'>
               {filteredRestaurants.length > 0 ? 'Restaurants near you' : 'No matches found'}
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
               {filteredRestaurants.length} result{filteredRestaurants.length !== 1 && 's'}
               {isVegOnly && ' • Pure Veg'} 
               {searchQuery && ` • "${searchQuery}"`}
            </p>
         </div>

         {/* Restaurants Grid */}
         <div className='max-w-7xl mx-auto px-4 pb-12 mt-4'>
            {filteredRestaurants.length > 0 ? (
               <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {filteredRestaurants.map((restaurant) => (
                     <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))}
               </div>
            ) : (
               <div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300'>
                  <div className='text-6xl mb-4 opacity-50'>🍳</div>
                  <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                     No restaurants found
                  </h3>
                  <p className='text-gray-500 text-center max-w-xs mb-6'>
                     We couldn't find any restaurants matching your current filters.
                  </p>
                  <button
                     onClick={() => {
                        setSearchQuery('');
                        setIsVegOnly(false);
                        setShowFilters(false);
                     }}
                     className='text-blue-600 font-medium hover:underline'
                  >
                     Clear all filters
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default Restaurants;