import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import AuthContext from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaChevronDown, FaBox, FaSignOutAlt, FaStore, FaHome, FaUtensils, FaEnvelope } from 'react-icons/fa';

const Navbar = () => {
   const { user, logout } = useContext(AuthContext);
   const navigate = useNavigate();
   const location = useLocation();
   const [cartCount, setCartCount] = useState(0);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
      if (user) {
         fetchCartCount();
      } else {
         setCartCount(0);
      }
   }, [user, location.pathname]);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const fetchCartCount = async () => {
      try {
         const response = await API.get('/cart');
         const items = response.data.data?.items || [];
         const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
         setCartCount(totalCount);
      } catch (error) {
         console.error("Error fetching the count:", error);
         setCartCount(0);
      }
   };

   const handleLogout = () => {
      logout();
      setDropdownOpen(false);
      navigate('/login');
   };

   const isActive = (path) => {
      return location.pathname === path;
   };

   return (
      <>
         <nav className="bg-white top-0 z-50 sticky shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
               <Link to="/" className="text-2xl font-bold text-blue-500 tracking-tighter">
                  Cravyo
               </Link>
               <div className='hidden md:flex space-x-6'>
                  <Link
                     to="/"
                     className={`text-gray-600 hover:text-blue-500 font-medium transition pb-1 border-b-2 ${isActive('/') ? 'border-blue-500 text-blue-500' : 'border-transparent'
                        }`}
                  >
                     Home
                  </Link>
                  <Link
                     to="/restaurants"
                     className={`text-gray-600 hover:text-blue-500 font-medium transition pb-1 border-b-2 ${isActive('/restaurants') ? 'border-blue-500 text-blue-500' : 'border-transparent'
                        }`}
                  >
                     Restaurants
                  </Link>
                  <Link
                     to="/contact-us"
                     className={`text-gray-600 hover:text-blue-500 font-medium transition pb-1 border-b-2 ${isActive('/contact-us') ? 'border-blue-500 text-blue-500' : 'border-transparent'
                        }`}
                  >
                     Contact Us
                  </Link>
               </div>
               <div className="flex items-center space-x-6">
                  {/* Cart Icon */}
                  <Link to="/cart" className="relative text-gray-600 hover:text-blue-500 transition">
                     <FaShoppingCart size={20} />
                     {cartCount > 0 && (
                        <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                           {cartCount > 99 ? '99+' : cartCount}
                        </span>
                     )}
                  </Link>
                  {user ? (
                     <div className="relative" ref={dropdownRef}>
                        <button
                           onClick={() => setDropdownOpen(!dropdownOpen)}
                           className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                           <FaUser size={14} />
                           <span className="hidden sm:block">Hi, {user.name?.split(" ")[0]}</span>
                           <FaChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                              <Link
                                 to="/profile"
                                 onClick={() => setDropdownOpen(false)}
                                 className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                              >
                                 <FaUser className="text-gray-500" size={14} />
                                 <span className="font-medium">Profile</span>
                              </Link>
                              {user.role === 'restaurant_owner' && (
                                 <Link
                                    to="/restaurant-dashboard"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                 >
                                    <FaStore className="text-gray-500" size={14} />
                                    <span className="font-medium">Restaurant Dashboard</span>
                                 </Link>
                              )}
                              {user.role === 'admin' && (
                                 <Link
                                    to="/admin-dashboard"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                                 >
                                    <FaStore className="text-gray-500" size={14} />
                                    <span className="font-medium">Dashboard</span>
                                 </Link>
                              )}
                              <Link
                                 to="/orders"
                                 onClick={() => setDropdownOpen(false)}
                                 className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                              >
                                 <FaBox className="text-gray-500" size={14} />
                                 <span className="font-medium">My Orders</span>
                              </Link>
                              <div className="border-t border-gray-200 my-2"></div>
                              <button
                                 onClick={handleLogout}
                                 className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                 <FaSignOutAlt className="text-red-500" size={14} />
                                 <span className="font-medium">Logout</span>
                              </button>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="space-x-2">
                        <Link to="/login" className="text-gray-600 hover:text-blue-500 font-medium px-3 py-2">
                           Login
                        </Link>
                        <Link to="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md">
                           Sign Up
                        </Link>
                     </div>
                  )}
               </div>
            </div>
         </nav>

         {/* Mobile Bottom Navigation Bar */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-2">
            <div className="bg-white rounded-full shadow-lg border border-gray-200 px-1 py-1.5">
               <div className="flex justify-around items-center">
                  <Link
                     to="/"
                     className={`flex flex-col items-center px-4 rounded-full transition ${isActive('/') ? 'bg-blue-50 text-blue-500' : 'text-gray-600 hover:text-blue-500'
                        }`}
                  >
                     <FaHome size={20} />
                     <span className="text-xs font-medium">Home</span>
                  </Link>
                  <Link
                     to="/restaurants"
                     className={`flex flex-col items-center px-4 rounded-full transition ${isActive('/restaurants') ? 'bg-blue-50 text-blue-500' : 'text-gray-600 hover:text-blue-500'
                        }`}
                  >
                     <FaUtensils size={20} />
                     <span className="text-xs font-medium">Restaurants</span>
                  </Link>
                  <Link
                     to="/contact-us"
                     className={`flex flex-col items-center px-4 rounded-full transition ${isActive('/contact-us') ? 'bg-blue-50 text-blue-500' : 'text-gray-600 hover:text-blue-500'
                        }`}
                  >
                     <FaEnvelope size={20} />
                     <span className="text-xs font-medium">Contact</span>
                  </Link>
               </div>
            </div>
         </div>
      </>
   );
};

export default Navbar;