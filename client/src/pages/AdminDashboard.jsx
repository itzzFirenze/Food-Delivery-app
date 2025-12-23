import React, { useState } from 'react';
import { FaUsers, FaStore, FaShoppingBag, FaTicketAlt } from 'react-icons/fa';
import UserTab from './admin-tabs/UserTab';
import RestaurantTab from './admin-tabs/RestaurantTab';
import OrderTab from './admin-tabs/OrderTab';
import CouponTab from './admin-tabs/CouponTab';

const AdminDashboard = () => {
   const [activeTab, setActiveTab] = useState('users');

   const renderTabContent = () => {
      switch (activeTab) {
         case 'users': return <UserTab />;
         case 'restaurants': return <RestaurantTab />;
         case 'orders': return <OrderTab />;
         case 'coupons': return <CouponTab />;
         default: return <UserTab />;
      }
   };

   const TabButton = ({ name, label, icon: Icon }) => (
      <button
         onClick={() => setActiveTab(name)}
         className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition flex items-center gap-2 ${
            activeTab === name
               ? 'bg-blue-600 text-white'
               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
         }`}
      >
         <Icon /> {label}
      </button>
   );

   return (
      <div className='min-h-screen bg-gray-50'>
         <div className='max-w-7xl mx-auto px-4 py-8'>
            <div className='mb-8'>
               <h1 className='text-4xl font-bold text-gray-900 mb-2'>Admin Dashboard</h1>
               <p className='text-gray-600'>Manage users, restaurants, orders, and coupons</p>
            </div>

            <div className='flex flex-wrap gap-4 mb-6'>
               <TabButton name="users" label="Users" icon={FaUsers} />
               <TabButton name="restaurants" label="Restaurants" icon={FaStore} />
               <TabButton name="orders" label="Orders" icon={FaShoppingBag} />
               <TabButton name="coupons" label="Coupons" icon={FaTicketAlt} />
            </div>

            {renderTabContent()}
         </div>
      </div>
   );
};

export default AdminDashboard;