import React, { useEffect, useState, useContext } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import API from '../services/api';
import AuthContext from '../context/AuthContext';

const Profile = () => {
   const { user, setUser } = useContext(AuthContext);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [editMode, setEditMode] = useState(false);
   const [passwordMode, setPasswordMode] = useState(false);
   const [saving, setSaving] = useState(false);

   const [profileData, setProfileData] = useState({
      name: '',
      email: '',
      phone: '',
      role: ''
   });

   const [passwordData, setPasswordData] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
   });

   useEffect(() => {
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      try {
         setLoading(true);
         const response = await API.get('/users/me');
         const userData = response.data.data;
         setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || ''
         });
         setError(null);
      } catch (err) {
         console.error('Error fetching profile:', err);
         setError('Failed to load profile');
      } finally {
         setLoading(false);
      }
   };

   const handleInputChange = (e) => {
      setProfileData({
         ...profileData,
         [e.target.name]: e.target.value
      });
   };

   const handlePasswordChange = (e) => {
      setPasswordData({
         ...passwordData,
         [e.target.name]: e.target.value
      });
   };

   const handleUpdateProfile = async () => {
      try {
         setSaving(true);
         const updateData = {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone
         };

         const response = await API.patch('/users/me', updateData);

         if (setUser) {
            setUser(response.data.data);
         }

         alert('Profile updated successfully!');
         setEditMode(false);
      } catch (err) {
         console.error('Error updating profile:', err);
         alert(err.response?.data?.message || 'Failed to update profile');
      } finally {
         setSaving(false);
      }
   };

   const handleUpdatePassword = async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         alert('New passwords do not match');
         return;
      }

      if (passwordData.newPassword.length < 6) {
         alert('New password must be at least 6 characters');
         return;
      }

      try {
         setSaving(true);
         await API.patch('/users/me', {
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
         });

         alert('Password updated successfully!');
         setPasswordMode(false);
         setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
         });
      } catch (err) {
         console.error('Error updating password:', err);
         alert(err.response?.data?.message || 'Failed to update password');
      } finally {
         setSaving(false);
      }
   };

   const handleCancel = () => {
      fetchProfile();
      setEditMode(false);
      setPasswordMode(false);
      setPasswordData({
         oldPassword: '',
         newPassword: '',
         confirmPassword: ''
      });
   };

   const getRoleBadge = (role) => {
      const roleConfig = {
         customer: { color: 'bg-blue-100 text-blue-800', label: 'Customer' },
         restaurant_owner: { color: 'bg-purple-100 text-purple-800', label: 'Restaurant Owner' },
         admin: { color: 'bg-red-100 text-red-800', label: 'Admin' }
      };

      const config = roleConfig[role] || roleConfig.customer;
      return (
         <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
            {config.label}
         </span>
      );
   };

   if (loading) {
      return (
         <div className='flex justify-center items-center min-h-screen bg-gray-50'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
         </div>
      );
   }

   if (error) {
      return (
         <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
            <div className='text-center'>
               <div className='text-red-500 font-semibold text-lg mb-4'>{error}</div>
               <button
                  onClick={fetchProfile}
                  className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition'
               >
                  Try Again
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className='min-h-screen bg-gray-50'>
         <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>My Profile</h1>
               <p className='text-gray-600'>Manage your account information</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
               {/* Profile Card */}
               <div className='lg:col-span-2 space-y-6'>
                  {/* Basic Information */}
                  <div className='bg-white rounded-2xl shadow-sm p-6'>
                     <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-2xl font-semibold text-gray-900'>Basic Information</h2>
                        {!editMode && !passwordMode && (
                           <button
                              onClick={() => setEditMode(true)}
                              className='flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
                           >
                              <FaEdit /> Edit Profile
                           </button>
                        )}
                     </div>

                     <div className='space-y-4'>
                        {/* Name */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-2'>
                              <FaUser className='inline mr-2 text-gray-400' />
                              Full Name
                           </label>
                           {editMode ? (
                              <input
                                 type='text'
                                 name='name'
                                 value={profileData.name}
                                 onChange={handleInputChange}
                                 className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                              />
                           ) : (
                              <p className='text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg'>{profileData.name}</p>
                           )}
                        </div>

                        {/* Email */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-2'>
                              <FaEnvelope className='inline mr-2 text-gray-400' />
                              Email Address
                           </label>
                           {editMode ? (
                              <input
                                 type='email'
                                 name='email'
                                 value={profileData.email}
                                 onChange={handleInputChange}
                                 className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                              />
                           ) : (
                              <p className='text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg'>{profileData.email}</p>
                           )}
                        </div>

                        {/* Phone */}
                        <div>
                           <label className='block text-sm font-medium text-gray-700 mb-2'>
                              <FaPhone className='inline mr-2 text-gray-400' />
                              Phone Number
                           </label>
                           {editMode ? (
                              <input
                                 type='tel'
                                 name='phone'
                                 value={profileData.phone}
                                 onChange={handleInputChange}
                                 className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                              />
                           ) : (
                              <p className='text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-lg'>{profileData.phone || 'Not provided'}</p>
                           )}
                        </div>
                     </div>

                     {/* Action Buttons for Edit Mode */}
                     {editMode && (
                        <div className='flex gap-3 mt-6'>
                           <button
                              onClick={handleUpdateProfile}
                              disabled={saving}
                              className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400 cursor-pointer'
                           >
                              <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                           </button>
                           <button
                              onClick={handleCancel}
                              disabled={saving}
                              className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition cursor-pointer'
                           >
                              <FaTimes /> Cancel
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Password Section */}
                  {!editMode && (
                     <div className='bg-white rounded-2xl shadow-sm p-6'>
                        <div className='flex items-center justify-between mb-6'>
                           <h2 className='text-2xl font-semibold text-gray-900'>Password & Security</h2>
                           {!passwordMode && (
                              <button
                                 onClick={() => setPasswordMode(true)}
                                 className='flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium cursor-pointer'
                              >
                                 <FaLock /> Change Password
                              </button>
                           )}
                        </div>

                        {passwordMode ? (
                           <div className='space-y-4'>
                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Old Password
                                 </label>
                                 <input
                                    type='password'
                                    name='oldPassword'
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    New Password
                                 </label>
                                 <input
                                    type='password'
                                    name='newPassword'
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                 />
                              </div>

                              <div>
                                 <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Confirm New Password
                                 </label>
                                 <input
                                    type='password'
                                    name='confirmPassword'
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                 />
                              </div>

                              <div className='flex gap-3 mt-6'>
                                 <button
                                    onClick={handleUpdatePassword}
                                    disabled={saving}
                                    className='flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400'
                                 >
                                    <FaSave /> {saving ? 'Updating...' : 'Update Password'}
                                 </button>
                                 <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className='flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition'
                                 >
                                    <FaTimes /> Cancel
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <p className='text-gray-600'>
                              Keep your account secure by using a strong password and updating it regularly.
                           </p>
                        )}
                     </div>
                  )}
               </div>

               {/* Sidebar Info */}
               <div className='space-y-6'>
                  {/* Account Info Card */}
                  <div className='bg-white rounded-2xl shadow-sm p-6'>
                     <h3 className='text-lg font-semibold text-gray-900 mb-4'>Account Info</h3>
                     <div className='space-y-4'>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Account Type</p>
                           {getRoleBadge(profileData.role)}
                        </div>
                        <div>
                           <p className='text-sm text-gray-600 mb-1'>Member Since</p>
                           <p className='text-gray-900 font-medium'>
                              {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric'
                              })}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Help Card */}
                  <div className='bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6'>
                     <h3 className='text-lg font-semibold text-gray-900 mb-2'>Need Help?</h3>
                     <p className='text-sm text-gray-600 mb-4'>
                        If you have any questions or need assistance with your account, feel free to contact us.
                     </p>
                     <button className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition cursor-pointer'>
                        Contact Support
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;