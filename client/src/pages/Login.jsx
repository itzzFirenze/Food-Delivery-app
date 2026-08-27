import React, { useState, useContext } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdHome } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
   const navigate = useNavigate();
   const { login } = useContext(AuthContext);
   const [showPassword, setShowPassword] = useState(false);
   const [formData, setFormData] = useState({
      email: '',
      password: ''
   });
   const [errors, setErrors] = useState({});
   const [loading, setLoading] = useState(false);

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value
      });
      if (errors[e.target.name]) {
         setErrors({
            ...errors,
            [e.target.name]: ''
         });
      }
   };

   const validateForm = () => {
      const newErrors = {};

      if (!formData.email.trim()) {
         newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
         newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
         newErrors.password = 'Password is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setLoading(true);

      try {
         const response = await API.post('/auth/login', formData);

         // Store the token in localStorage
         login(response.data.token, response.data.user);

         // Reset form
         setFormData({
            email: '',
            password: ''
         });

         navigate('/');

      } catch (error) {
         setLoading(false);

         if (error.response && error.response.data && error.response.data.error) {
            setErrors({
               general: error.response.data.error
            });
         } else {
            setErrors({
               general: 'Login failed. Please try again.'
            });
         }
      }
   };

   return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
         <div className="max-w-md w-full">
            <div className="text-center mb-8">
               <h1 className="text-5xl font-bold text-blue-500 mb-2">Cravyo</h1>
               <p className="text-gray-600 text-lg">Welcome back!</p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Sign In
               </h2>

               {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-3xl border border-red-100 text-center">
                     {errors.general}
                  </div>
               )}

               <div className="space-y-5">
                  <div>
                     <label className="block text-gray-700 font-medium mb-2">
                        Email Address
                     </label>
                     <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="john@example.com"
                           className={`w-full pl-10 pr-4 py-3 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                              }`}
                        />
                     </div>
                     {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                     )}
                  </div>

                  <div>
                     <label className="block text-gray-700 font-medium mb-2">
                        Password
                     </label>
                     <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                           type={showPassword ? 'text' : 'password'}
                           name="password"
                           value={formData.password}
                           onChange={handleChange}
                           placeholder="••••••••"
                           className={`w-full pl-10 pr-12 py-3 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                              }`}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                           {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                     </div>
                     {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                     )}
                  </div>

                  <div className="text-right">
                     <a
                        href="#"
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                     >
                        Forgot password?
                     </a>
                  </div>

                  <button
                     onClick={handleSubmit}
                     disabled={loading}
                     className="w-full bg-blue-500 text-white py-3 rounded-3xl font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                     {loading ? (
                        <span className="flex items-center justify-center">
                           <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                                 fill="none"
                              />
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                           </svg>
                           Processing...
                        </span>
                     ) : (
                        'Sign In'
                     )}
                  </button>
               </div>

               <p className="text-center text-gray-600 text-sm mt-6">
                  Don't have an account?{' '}
                  <a href="/register" className="text-blue-500 hover:text-blue-600 font-semibold">
                     Sign up
                  </a>
               </p>

               <div className="text-center pt-4">
                  <a
                     href="/"
                     className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600"
                  >
                     <MdHome size={20} />
                     <span>Go Home</span>
                  </a>
               </div>

            </div>

            <p className="text-center text-gray-500 text-sm mt-8">
               © 2025 Cravyo. All rights reserved.
            </p>
         </div>
      </div>
   );
};

export default Login;