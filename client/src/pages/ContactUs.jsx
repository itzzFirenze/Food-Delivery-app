import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Footer from '../components/Footer'; // Adjust path based on your folder structure

const ContactUs = () => {

   return (
      <div className='min-h-screen bg-gray-50'>
         {/* Hero Section */}
         <div className='bg-blue-400 text-white'>
            <div className='w-full mx-auto px-4 py-16 md:py-20'>
               <div className='text-center'>
                  <h1 className='text-5xl md:text-6xl font-extrabold mb-4 leading-tight'>
                     Get in <span className='text-yellow-300'>Touch</span>
                  </h1>
                  <p className='text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto'>
                     Have a question or feedback? We'd love to hear from you!
                  </p>
               </div>
            </div>
         </div>

         {/* Contact Information Cards */}
         <div className='max-w-7xl mx-auto px-4 -mt-8 relative z-10'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
               <div className='bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                     <FaPhone className='text-blue-500 text-2xl' />
                  </div>
                  <h3 className='text-gray-900 font-semibold text-lg mb-2'>Phone</h3>
                  <p className='text-gray-600'>+1 (555) 123-4567</p>
               </div>

               <div className='bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                     <FaEnvelope className='text-blue-500 text-2xl' />
                  </div>
                  <h3 className='text-gray-900 font-semibold text-lg mb-2'>Email</h3>
                  <p className='text-gray-600'>support@cravyo.com</p>
               </div>

               <div className='bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                     <FaMapMarkerAlt className='text-blue-500 text-2xl' />
                  </div>
                  <h3 className='text-gray-900 font-semibold text-lg mb-2'>Address</h3>
                  <p className='text-gray-600'>123 Food Street, NY 10001</p>
               </div>

               <div className='bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                     <FaClock className='text-blue-500 text-2xl' />
                  </div>
                  <h3 className='text-gray-900 font-semibold text-lg mb-2'>Hours</h3>
                  <p className='text-gray-600'>24/7 Support</p>
               </div>
            </div>
         </div>

         {/* Map and Office Info Section */}
         <div className='max-w-7xl mx-auto px-4 py-16'>
            <div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
               <h2 className='text-3xl font-bold text-gray-900 mb-6'>Visit Our Office</h2>
               <div className='bg-gray-200 rounded-lg h-64 mb-6 flex items-center justify-center'>
                  <div className='text-center text-gray-500'>
                     <FaMapMarkerAlt className='text-6xl mx-auto mb-3' />
                     <p className='text-lg'>Map Location</p>
                  </div>
               </div>
               <div className='space-y-4'>
                  <div>
                     <h4 className='font-semibold text-gray-900 mb-2'>Main Office</h4>
                     <p className='text-gray-600'>123 Food Street, Suite 100</p>
                     <p className='text-gray-600'>New York, NY 10001</p>
                  </div>
                  <div>
                     <h4 className='font-semibold text-gray-900 mb-2'>Working Hours</h4>
                     <p className='text-gray-600'>Monday - Friday: 9:00 AM - 6:00 PM</p>
                     <p className='text-gray-600'>Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
               </div>
            </div>
         </div>

         {/* FAQ Section */}
         <div className='bg-white py-16'>
            <div className='max-w-7xl mx-auto px-4'>
               <div className='text-center mb-12'>
                  <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-2'>
                     Frequently Asked Questions
                  </h2>
                  <p className='text-gray-600 text-lg'>
                     Quick answers to common questions
                  </p>
               </div>

               <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
                  <div className='bg-gray-50 rounded-xl p-6'>
                     <h4 className='font-semibold text-gray-900 mb-2 text-lg'>What are your delivery hours?</h4>
                     <p className='text-gray-600'>We deliver 24/7 to ensure you can get your favorite food whenever you're craving it.</p>
                  </div>

                  <div className='bg-gray-50 rounded-xl p-6'>
                     <h4 className='font-semibold text-gray-900 mb-2 text-lg'>How do I track my order?</h4>
                     <p className='text-gray-600'>Once your order is placed, you'll receive real-time updates via SMS and email with tracking information.</p>
                  </div>

                  <div className='bg-gray-50 rounded-xl p-6'>
                     <h4 className='font-semibold text-gray-900 mb-2 text-lg'>What payment methods do you accept?</h4>
                     <p className='text-gray-600'>We accept all major credit cards, debit cards, digital wallets, and cash on delivery.</p>
                  </div>

                  <div className='bg-gray-50 rounded-xl p-6'>
                     <h4 className='font-semibold text-gray-900 mb-2 text-lg'>Can I cancel my order?</h4>
                     <p className='text-gray-600'>Yes, you can cancel your order within 5 minutes of placing it for a full refund.</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Imported Footer */}
         <Footer />
      </div>
   );
};

export default ContactUs;