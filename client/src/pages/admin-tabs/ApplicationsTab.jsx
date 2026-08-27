import React, { useEffect, useState } from 'react';
import { FaEye, FaCheck, FaTimes, FaStore, FaClock } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import API from '../../services/api';

const ApplicationsTab = () => {
   const [applications, setApplications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedApplication, setSelectedApplication] = useState(null);
   const [processing, setProcessing] = useState(false);

   useEffect(() => {
      fetchApplications(true);
      const interval = setInterval(() => fetchApplications(false), 5000);
      return () => clearInterval(interval);
   }, []);

   const fetchApplications = async (showLoading = true) => {
      try {
         if (showLoading) setLoading(true);
         const response = await API.get('/users/applications/pending');
         setApplications(response.data.data || []);
      } catch (err) {
         console.error('Error fetching applications:', err);
      } finally {
         if (showLoading) setLoading(false);
      }
   };
   
   const handleApprove = async (userId, userName) => {
      try {
         setProcessing(true);
         await API.patch(`/users/applications/${userId}/review`, { action: 'approve' });
         toast.success(`${userName}'s application approved!`);
         fetchApplications(false);
         setSelectedApplication(null);
      } catch (err) {
         console.error('Error approving application:', err);
         toast.error(err.response?.data?.message || 'Failed to approve application');
      } finally {
         setProcessing(false);
      }
   };

   const handleDecline = async (userId, userName) => {
      try {
         setProcessing(true);
         await API.patch(`/users/applications/${userId}/review`, { action: 'decline' });
         toast.success(`${userName}'s application declined`);
         fetchApplications(false);
         setSelectedApplication(null);
      } catch (err) {
         console.error('Error declining application:', err);
         toast.error(err.response?.data?.message || 'Failed to decline application');
      } finally {
         setProcessing(false);
      }
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   if (loading) {
      return (
         <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
         </div>
      );
   }

   return (
      <div className='bg-white rounded-2xl shadow-sm p-6'>
         <Toaster position='top-center' reverseOrder={false} />

         <div className='flex items-center gap-3 mb-6'>
            <FaStore className='text-purple-600 text-2xl' />
            <h2 className='text-2xl font-semibold text-gray-900'>
               Restaurant Owner Applications ({applications.length})
            </h2>
         </div>

         {applications.length === 0 ? (
            <div className='text-center py-16'>
               <FaClock className='mx-auto text-6xl text-gray-300 mb-4' />
               <p className='text-gray-600 text-lg'>No pending applications</p>
               <p className='text-gray-500 text-sm mt-2'>Applications will appear here when users apply</p>
            </div>
         ) : (
            <div className='overflow-x-auto'>
               <table className='w-full'>
                  <thead className='bg-gray-50'>
                     <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Applicant</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Email</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Phone</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Applied Date</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                     </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                     {applications.map((user) => (
                        <tr key={user._id} className='hover:bg-gray-50 transition'>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='font-medium text-gray-900'>{user.name}</div>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                              {user.email}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                              {user.phone || 'N/A'}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                              {formatDate(user.restaurantOwnerApplication?.appliedAt)}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <span className='px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300'>
                                 Pending Review
                              </span>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm'>
                              <div className='flex gap-2'>
                                 <button
                                    onClick={() => setSelectedApplication(user)}
                                    className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition'
                                    title='View Details'
                                 >
                                    <FaEye />
                                 </button>
                                 <button
                                    onClick={() => handleApprove(user._id, user.name)}
                                    disabled={processing}
                                    className='p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer transition disabled:opacity-50'
                                    title='Approve'
                                 >
                                    <FaCheck />
                                 </button>
                                 <button
                                    onClick={() => handleDecline(user._id, user.name)}
                                    disabled={processing}
                                    className='p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition disabled:opacity-50'
                                    title='Decline'
                                 >
                                    <FaTimes />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* Application Detail Modal */}
         {selectedApplication && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
                  <div className='flex justify-between items-start mb-6'>
                     <div className='flex items-center gap-3'>
                        <div className='bg-purple-100 p-3 rounded-full'>
                           <FaStore className='text-purple-600 text-xl' />
                        </div>
                        <div>
                           <h2 className='text-2xl font-bold text-gray-900'>Application Details</h2>
                           <p className='text-sm text-gray-600'>Review restaurant owner application</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setSelectedApplication(null)}
                        className='text-gray-400 hover:text-gray-600 cursor-pointer transition'
                     >
                        <FaTimes className='text-xl' />
                     </button>
                  </div>

                  <div className='bg-gray-50 rounded-xl p-6 space-y-4 mb-6'>
                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Full Name</p>
                           <p className='font-semibold text-gray-900'>{selectedApplication.name}</p>
                        </div>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>User ID</p>
                           <p className='font-mono text-sm text-gray-700'>{selectedApplication._id}</p>
                        </div>
                     </div>

                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Email Address</p>
                           <p className='font-semibold text-gray-900'>{selectedApplication.email}</p>
                        </div>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Phone Number</p>
                           <p className='font-semibold text-gray-900'>{selectedApplication.phone || 'Not provided'}</p>
                        </div>
                     </div>

                     <div className='grid grid-cols-2 gap-4'>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Current Role</p>
                           <span className='inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                              {selectedApplication.role}
                           </span>
                        </div>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Member Since</p>
                           <p className='font-semibold text-gray-900'>
                              {new Date(selectedApplication.createdAt).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric'
                              })}
                           </p>
                        </div>
                     </div>

                     <div>
                        <p className='text-sm text-gray-600 mb-1'>Application Date</p>
                        <p className='font-semibold text-gray-900'>
                           {formatDate(selectedApplication.restaurantOwnerApplication?.appliedAt)}
                        </p>
                     </div>

                     <div>
                        <p className='text-sm text-gray-600 mb-1'>Application Status</p>
                        <span className='inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300'>
                           Pending Review
                        </span>
                     </div>
                  </div>

                  <div className='flex gap-3'>
                     <button
                        onClick={() => setSelectedApplication(null)}
                        disabled={processing}
                        className='flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg cursor-pointer font-semibold transition disabled:opacity-50'
                     >
                        Close
                     </button>
                     <button
                        onClick={() => handleDecline(selectedApplication._id, selectedApplication.name)}
                        disabled={processing}
                        className='flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg cursor-pointer font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2'
                     >
                        <FaTimes /> {processing ? 'Processing...' : 'Decline'}
                     </button>
                     <button
                        onClick={() => handleApprove(selectedApplication._id, selectedApplication.name)}
                        disabled={processing}
                        className='flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg cursor-pointer font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2'
                     >
                        <FaCheck /> {processing ? 'Processing...' : 'Approve'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ApplicationsTab;