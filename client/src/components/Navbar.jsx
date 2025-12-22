import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = () => {
   const { user, logout } = useContext(AuthContext);
   const navigate = useNavigate();
   const location = useLocation();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   const isActive = (path) => {
      return location.pathname === path;
   };

   return (
      <nav className="bg-white top-0 z-50 sticky">
         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-500 tracking-tighter">
               Cravyo
            </Link>
            <div className='flex space-x-6'>
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
                  to="/contact"
                  className={`text-gray-600 hover:text-blue-500 font-medium transition pb-1 border-b-2 ${isActive('/contact') ? 'border-blue-500 text-blue-500' : 'border-transparent'
                     }`}
               >
                  Contact Us
               </Link>
            </div>
            <div className="flex items-center space-x-6">
               {/* Cart Icon */}
               <Link to="/cart" className="relative text-gray-600 hover:text-blue-500 transition">
                  <FaShoppingCart size={20} />
                  {/* Optional: Add badge count here later */}
               </Link>
               {user ? (
                  <div className="flex items-center space-x-4">
                     <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                        Hi, {user.name?.split(" ")[0]}
                     </span>
                     <button
                        onClick={handleLogout}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                     >
                        Logout
                     </button>
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
   );
};

export default Navbar;