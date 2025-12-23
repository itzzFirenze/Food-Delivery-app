import React, { useEffect, useState } from 'react';
import { FaEye, FaTrash, FaTimes } from 'react-icons/fa';
import API from '../../services/api';

const UserTab = () => {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedUser, setSelectedUser] = useState(null);

   useEffect(() => {
      fetchUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const response = await API.get('/users');
         setUsers(response.data.data || []);
      } catch (err) {
         console.error('Error fetching users:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleDeleteUser = async (userId) => {
      if (!window.confirm('Are you sure you want to delete this user?')) return;
      try {
         await API.delete(`/users/${userId}`);
         alert('User deleted successfully!');
         fetchUsers();
         setSelectedUser(null);
      } catch (err) {
         alert(err.response?.data?.message || 'Failed to delete user');
      }
   };

   if (loading) return <div className="p-12 text-center">Loading users...</div>;

   return (
      <div className='bg-white rounded-2xl shadow-sm p-6'>
         <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Users ({users.length})</h2>
         {users.length === 0 ? (
            <div className='text-center py-12 text-gray-600'>No users found</div>
         ) : (
            <div className='overflow-x-auto'>
               <table className='w-full'>
                  <thead className='bg-gray-50'>
                     <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Name</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Email</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Role</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                     </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                     {users.map((user) => (
                        <tr key={user._id}>
                           <td className='px-6 py-4 whitespace-nowrap'>{user.name}</td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{user.email}</td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                 }`}>{user.role}</span>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm flex gap-2'>
                              <button onClick={() => setSelectedUser(user)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer'><FaEye /></button>
                              <button onClick={() => handleDeleteUser(user._id)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer'><FaTrash /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {/* User Detail Modal */}
         {selectedUser && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
               <div className='bg-white rounded-2xl max-w-2xl w-full p-6'>
                  <div className='flex justify-between mb-4'>
                     <h2 className='text-2xl font-bold'>User Details</h2>
                     <button onClick={() => setSelectedUser(null)} className='cursor-pointer'><FaTimes /></button>
                  </div>
                  <div className="space-y-2">
                     <p><strong>UserID:</strong>{selectedUser._id}</p>
                     <p><strong>Name:</strong> {selectedUser.name}</p>
                     <p><strong>Email:</strong> {selectedUser.email}</p>
                     <p><strong>Role:</strong> {selectedUser.role}</p>
                     <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className='mt-6 flex gap-3'>
                     <button onClick={() => setSelectedUser(null)} className='flex-1 bg-gray-200 py-3 rounded-lg cursor-pointer font-semibold'>Close</button>
                     <button onClick={() => handleDeleteUser(selectedUser._id)} className='flex-1 bg-red-600 text-white py-3 rounded-lg cursor-pointer font-semibold'>Delete User</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default UserTab;