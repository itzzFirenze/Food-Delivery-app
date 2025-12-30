import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
   return (
      <footer className='bg-gray-900 text-gray-300 pt-12 pb-8'>
         <div className='max-w-7xl mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
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

               <div>
                  <h4 className='text-white text-lg font-semibold mb-4'>Company</h4>
                  <ul className='space-y-2'>
                     <li><a href='#' className='hover:text-white transition-colors'>About Us</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>Careers</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>Team</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>Blog</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className='text-white text-lg font-semibold mb-4'>Support</h4>
                  <ul className='space-y-2'>
                     <li><a href='#' className='hover:text-white transition-colors'>Help Center</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>Safety</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>Contact Us</a></li>
                     <li><a href='#' className='hover:text-white transition-colors'>FAQs</a></li>
                  </ul>
               </div>

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

            <div className='border-t border-gray-800 pt-8 mt-8 text-center'>
               <p className='text-gray-400'>
                  © 2025 Cravyo. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   );
};

export default Footer;