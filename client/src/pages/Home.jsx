import React, { useState } from 'react';
import API from '../services/api';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
   // const [restaurants, setRestaurants] = useState([]);
   // const [loading, setLoading] = useState(true);
   // const [error, setError] = useState(null);
   const [searchQuery, setSearchQuery] = useState('');

   // useEffect(() => {
   //    const fetchRestaurants = async () => {
   //       try {
   //          const { data } = await API.get('/restaurants');
   //          setRestaurants(data.data);
   //          setLoading(false);
   //       } catch (error) {
   //          console.error("Error fetching restaurants", error);
   //          setError("Failed to load restaurants");
   //          setLoading(false);
   //       }
   //    };
   //    fetchRestaurants();
   // }, []);


   // if (loading) {
   //    return (
   //       <div className='flex justify-center items-center min-h-screen bg-gray-50'>
   //          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
   //       </div>
   //    );
   // }

   // if (error) {
   //    return (
   //       <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
   //          <div className='text-center text-red-500 font-semibold text-lg'>
   //             {error}
   //          </div>
   //       </div>
   //    );
   // }

   return (
      <div className='min-h-screen'>
         {/* Hero Section */}
         <div className='bg-blue-400 text-white'>
            <div className='w-full mx-auto px-4 py-16 md:py-24'>
               <div className='text-center'>
                  <h1 className='text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight'>
                     Delicious Food,
                     <br />
                     <span className='text-yellow-300'>Delivered Fast</span>
                  </h1>
                  <p className='text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto'>
                     Order from the best local restaurants with easy on-demand delivery
                  </p>

                  {/* Search Bar */}
                  <div className='max-w-2xl mx-auto mb-8'>
                     <div className='relative'>
                        <input
                           type='text'
                           placeholder='Search restaurants or cuisines...'
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className='w-full px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-xl bg-white'
                        />
                        <button className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-8 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors cursor-pointer'>
                           Search
                        </button>
                     </div>
                  </div>

                  {/* Stats or Features */}
                  <div className='flex flex-wrap justify-center gap-8 md:gap-12 mt-12'>
                     <div className='text-center'>
                        <div className='text-4xl font-bold text-yellow-300'>500+</div>
                        <div className='text-blue-100 mt-1'>Restaurants</div>
                     </div>
                     <div className='text-center'>
                        <div className='text-4xl font-bold text-yellow-300'>30min</div>
                        <div className='text-blue-100 mt-1'>Avg Delivery</div>
                     </div>
                     <div className='text-center'>
                        <div className='text-4xl font-bold text-yellow-300'>50K+</div>
                        <div className='text-blue-100 mt-1'>Happy Users</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Food Categories Section */}
         <div className='w-full px-4 py-28 bg-white'>
            <div className='max-w-7xl mx-auto'>
               <div className='text-center mb-10'>
                  <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
                     What's on your mind?
                  </h2>
                  <p className='text-gray-600 text-lg'>
                     Choose from our popular food categories
                  </p>
               </div>

               <div className='flex flex-wrap justify-center gap-8 md:gap-16'>
                  {[
                     { name: 'Pizza', image: 'https://assets.surlatable.com/m/15a89c2d9c6c1345/72_dpi_webp-REC-283110_Pizza-jpg' },
                     { name: 'Burger', image: 'https://www.foodandwine.com/thmb/XE8ubzwObCIgMw7qJ9CsqUZocNM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MSG-Smash-Burger-FT-RECIPE0124-d9682401f3554ef683e24311abdf342b.jpg' },
                     { name: 'Sushi', image: 'https://restaurantindia.s3.ap-south-1.amazonaws.com/s3fs-public/2021-08/sushi-2853382_1280.jpg' },
                     { name: 'Pasta', image: 'https://images.themodernproper.com/production/posts/2022/PastaCarbonara_Shot7_13.jpg?w=1200&h=1200&q=60&fm=jpg&fit=crop&dm=1757717956&s=d665fbadba257a34badebee71a1c34e5' },
                     { name: 'Dessert', image: 'https://www.southernliving.com/thmb/l7INZHNOP2-MzwCCq6gt7z3y_fE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Peanut_Butter_Pretzel_Pie_012-09c44a5d8f164dbeb149035b5eae14fe.jpg' }
                  ].map((category, index) => (
                     <div key={index} className='flex flex-col items-center cursor-pointer group'>
                        <div className='w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-transform duration-300 bg-gray-200'>
                           <img
                              src={category.image}
                              alt={category.name}
                              className='w-full h-full object-cover'
                           />
                        </div>
                        <p className='mt-4 text-gray-800 font-semibold text-xl'>{category.name}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Footer Section */}
         <footer className='bg-gray-900 text-gray-300 pt-12 pb-8'>
            <div className='max-w-7xl mx-auto px-4'>
               <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
                  {/* Company Info */}
                  <div>
                     <h3 className='text-white text-2xl font-bold mb-4'>Cravyo</h3>
                     <p className='text-gray-400 mb-4'>
                        Delicious food delivered to your doorstep. Fast, easy, and reliable.
                     </p>
                     <div className='flex gap-4'>
                        <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                           <FaFacebook className='w-6 h-6' />
                        </a>
                        <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                           <FaTwitter className='w-6 h-6' />
                        </a>
                        <a href='#' className='text-gray-400 hover:text-white transition-colors'>
                           <FaInstagram className='w-6 h-6' />
                        </a>
                     </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                     <h4 className='text-white text-lg font-semibold mb-4'>Company</h4>
                     <ul className='space-y-2'>
                        <li><a href='#' className='hover:text-white transition-colors'>About Us</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Careers</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Team</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Blog</a></li>
                     </ul>
                  </div>

                  {/* Support */}
                  <div>
                     <h4 className='text-white text-lg font-semibold mb-4'>Support</h4>
                     <ul className='space-y-2'>
                        <li><a href='#' className='hover:text-white transition-colors'>Help Center</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Safety</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Contact Us</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>FAQs</a></li>
                     </ul>
                  </div>

                  {/* Legal */}
                  <div>
                     <h4 className='text-white text-lg font-semibold mb-4'>Legal</h4>
                     <ul className='space-y-2'>
                        <li><a href='#' className='hover:text-white transition-colors'>Terms & Conditions</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Privacy Policy</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Cookie Policy</a></li>
                        <li><a href='#' className='hover:text-white transition-colors'>Refund Policy</a></li>
                     </ul>
                  </div>
               </div>

               {/* Bottom Bar */}
               <div className='border-t border-gray-800 pt-8 mt-8 text-center'>
                  <p className='text-gray-400'>
                     © 2025 Cravyo. All rights reserved.
                  </p>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Home;