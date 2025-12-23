import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const DeleteModal = ({
   isOpen,
   onClose,
   onConfirm,
   title = "Confirm Delete",
   message = "Are you sure you want to delete this item? This action cannot be undone.",
   confirmText = "Delete",
   cancelText = "Cancel",
   isLoading = false
}) => {
   if (!isOpen) return null;

   return (
      <div className='fixed inset-0 z-50 flex items-center justify-center'>
         {/* Backdrop */}
         <div
            className='absolute inset-0 bg-black bg-opacity-50 transition-opacity'
            onClick={onClose}
         ></div>

         {/* Modal */}
         <div className='relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in'>
            {/* Close Button */}
            <button
               onClick={onClose}
               className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer'
            >
               <FaTimes size={20} />
            </button>

            {/* Icon */}
            <div className='flex justify-center mb-4'>
               <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                  <FaExclamationTriangle className='text-red-600 text-3xl' />
               </div>
            </div>

            {/* Title */}
            <h2 className='text-2xl font-bold text-gray-900 text-center mb-3'>
               {title}
            </h2>

            {/* Message */}
            <p className='text-gray-600 text-center mb-6'>
               {message}
            </p>

            {/* Buttons */}
            <div className='flex gap-3'>
               <button
                  onClick={onClose}
                  disabled={isLoading}
                  className='flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
               >
                  {cancelText}
               </button>
               <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className='flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
               >
                  {isLoading ? 'Deleting...' : confirmText}
               </button>
            </div>
         </div>

         <style jsx>{`
            @keyframes scale-in {
               from {
                  transform: scale(0.95);
                  opacity: 0;
               }
               to {
                  transform: scale(1);
                  opacity: 1;
               }
            }
            .animate-scale-in {
               animation: scale-in 0.2s ease-out;
            }
         `}</style>
      </div>
   );
};

export default DeleteModal;