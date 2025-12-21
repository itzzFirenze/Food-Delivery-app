import React from 'react'
import { Link } from 'react-router-dom'

const RestaurantCard = ({ restaurant }) => {
   return (
      <Link 
         to={`/restaurant/${restaurant._id}`}
         className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block"
      >
         {/* Image Section with Overlay */}
         <div className="relative h-52 w-full">
            <img
               src={restaurant.image || "https://via.placeholder.com/400x300?text=Restaurant"}
               alt={restaurant.name}
               className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Restaurant Name - Bottom Left */}
            <div className="absolute bottom-3 left-4">
               <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                  {restaurant.name}
               </h3>
            </div>

            {/* Rating Badge - Bottom Right */}
            {restaurant.rating && (
               <div className="absolute bottom-3 right-4 bg-green-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                  <span className="text-white text-lg">★</span>
                  <span className="font-semibold">{restaurant.rating}</span>
               </div>
            )}
         </div>

         {/* Content Section */}
         <div className="p-4">
            {/* Cuisine Type */}
            <p className="text-gray-600 text-sm mb-1">
               {restaurant.cuisine || 'Multi Cuisine'}
            </p>

            {/* Location and Distance */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
               <span className="truncate flex-1">{restaurant.address || restaurant.location}</span>
               {restaurant.distance && (
                  <span className="ml-2 whitespace-nowrap">{restaurant.distance}</span>
               )}
            </div>

            {/* Table Booking Button */}
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-3">
               <span className="text-gray-600">📅</span>
               <span>Table booking</span>
            </button>

            {/* Offer Banner */}
            {/* {restaurant.offer && (
               <div className="bg-teal-50 text-teal-700 text-sm font-medium py-2 px-4 rounded-lg text-center border border-teal-100">
                  {restaurant.offer}
               </div>
            )} */}
         </div>
      </Link>
   )
}

export default RestaurantCard