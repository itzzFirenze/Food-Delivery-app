import React from 'react'
import { Link } from 'react-router-dom'
import { MdRestaurantMenu } from "react-icons/md";

const RestaurantCard = ({ restaurant }) => {
   return (
      <Link 
         to={`/restaurant/${restaurant._id}`}
         className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 block relative"
      >
         {/* Image Section with Parallax Zoom Effect */}
         <div className="relative h-52 w-full overflow-hidden">
            <img
               src={restaurant.image || "https://via.placeholder.com/400x300?text=Restaurant"}
               alt={restaurant.name}
               className="w-full h-full object-cover transform transition-transform duration-700 ease-in-out group-hover:scale-110 group-hover:brightness-90"
            />
            
            {/* Dark gradient overlay (Always visible for text readability) */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
            
            {/* Restaurant Name - Bottom Left */}
            <div className="absolute bottom-3 left-4 right-16 z-10 translate-y-0 transition-transform duration-300 group-hover:-translate-y-1">
               <h3 className="text-white text-xl font-bold leading-tight drop-shadow-md line-clamp-1">
                  {restaurant.name}
               </h3>
            </div>

            {/* Rating Badge - Bottom Right (Floating) */}
            {restaurant.rating && (
               <div className="absolute bottom-3 right-4 z-10 bg-white/20 backdrop-blur-md border border-white/30 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="font-bold text-sm">{restaurant.rating}</span>
               </div>
            )}
         </div>

         {/* Content Section */}
         <div className="p-4 bg-white relative z-20">
            {/* Cuisine & Distance Row */}
            <div className="flex justify-between items-start mb-3">
               <div className='flex flex-col'>
                   <p className="text-gray-800 font-medium text-sm">
                      {restaurant.cuisine || 'Multi Cuisine'}
                   </p>
                   <p className="text-gray-500 text-xs mt-0.5 truncate max-w-37.5">
                      {restaurant.address || restaurant.location}
                   </p>
               </div>
               
               {restaurant.distance && (
                  <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                     {restaurant.distance}
                  </div>
               )}
            </div>
         </div>
      </Link>
   )
}

export default RestaurantCard