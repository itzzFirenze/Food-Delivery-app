import React, { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaUniversity, FaWallet, FaLock, FaGoogle, FaAmazon } from 'react-icons/fa';
import { SiPhonepe, SiPaytm } from 'react-icons/si';

const PaymentGateway = ({ totalAmount, onProcessPayment, onClose }) => {
   const [activeTab, setActiveTab] = useState('upi');
   const [upiMethod, setUpiMethod] = useState(''); 
   const [upiId, setUpiId] = useState('');
   const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

   // Mock Payment Processing
   const handlePay = () => {
      const paymentData = {
         method: activeTab,
         details: activeTab === 'card' ? cardDetails : { upiId, app: upiMethod },
         amount: totalAmount
      };
      onProcessPayment(paymentData);
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         {/* Main Modal Container */}
         <div className="bg-white w-full max-w-4xl h-150 rounded-lg shadow-2xl flex overflow-hidden relative">

            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
               ✕
            </button>

            {/* Merchant Info & Methods */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
               {/* Header */}
               <div className="p-6 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        C
                     </div>
                     <div>
                        <h3 className="font-bold text-gray-800">Cravyo Foods</h3>
                        <p className="text-xs text-gray-500">Order #12345</p>
                     </div>
                  </div>
                  <div className="mt-4">
                     <p className="text-gray-500 text-sm">Amount to Pay</p>
                     <h2 className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</h2>
                  </div>
               </div>

               {/* Navigation Menu */}
               <nav className="flex-1 overflow-y-auto py-2">
                  <NavItem
                     icon={<FaMobileAlt />}
                     label="UPI"
                     active={activeTab === 'upi'}
                     onClick={() => setActiveTab('upi')}
                     subtext="GPay, PhonePe, Paytm"
                  />
                  <NavItem
                     icon={<FaCreditCard />}
                     label="Card"
                     active={activeTab === 'card'}
                     onClick={() => setActiveTab('card')}
                     subtext="Visa, MasterCard, RuPay"
                  />
                  {/* <NavItem
                     icon={<FaUniversity />}
                     label="Netbanking"
                     active={activeTab === 'netbanking'}
                     onClick={() => setActiveTab('netbanking')}
                     subtext="All Indian banks"
                  />
                  <NavItem
                     icon={<FaWallet />}
                     label="Wallet"
                     active={activeTab === 'wallet'}
                     onClick={() => setActiveTab('wallet')}
                  /> */}
               </nav>
            </div>

            {/* Forms */}
            <div className="w-2/3 bg-white p-8 flex flex-col relative">
               <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                  {activeTab === 'upi' ? 'UPI Payment' : activeTab === 'card' ? 'Add New Card' : 'Select Bank'}
               </h2>

               <div className="flex-1 overflow-y-auto">
                  {/* 1. UPI SECTION */}
                  {activeTab === 'upi' && (
                     <div className="space-y-6">
                        <p className="text-sm text-gray-600">Select an App to pay</p>
                        <div className="grid grid-cols-2 gap-4">
                           <UpiAppButton
                              icon={<FaGoogle className="text-red-500" />}
                              name="Google Pay"
                              selected={upiMethod === 'gpay'}
                              onClick={() => setUpiMethod('gpay')}
                           />
                           <UpiAppButton
                              icon={<SiPhonepe className="text-purple-600" />}
                              name="PhonePe"
                              selected={upiMethod === 'phonepe'}
                              onClick={() => setUpiMethod('phonepe')}
                           />
                           <UpiAppButton
                              icon={<SiPaytm className="text-blue-400" />}
                              name="Paytm"
                              selected={upiMethod === 'paytm'}
                              onClick={() => setUpiMethod('paytm')}
                           />
                           <UpiAppButton
                              icon={<FaAmazon className="text-yellow-600" />}
                              name="Amazon Pay"
                              selected={upiMethod === 'amazon'}
                              onClick={() => setUpiMethod('amazon')}
                           />
                        </div>

                        <div className="relative">
                           <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-200"></div>
                           </div>
                           <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">OR Pay via UPI ID</span>
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Enter UPI ID</label>
                           <div className="mt-1 flex gap-2">
                              <input
                                 type="text"
                                 placeholder="e.g. mobile@upi"
                                 className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                 value={upiId}
                                 onChange={(e) => setUpiId(e.target.value)}
                              />
                              <button className="bg-blue-50 text-blue-600 px-4 rounded-md font-medium text-sm hover:bg-blue-100">
                                 Verify
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* 2. CARD SECTION */}
                  {activeTab === 'card' && (
                     <div className="space-y-4 max-w-md">
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Card Number</label>
                           <div className="relative mt-1">
                              <input
                                 type="text"
                                 maxLength="19"
                                 placeholder="0000 0000 0000 0000"
                                 className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                 value={cardDetails.number}
                                 onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              />
                              <FaCreditCard className="absolute left-3 top-3 text-gray-400" />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Expiry</label>
                              <input
                                 type="text"
                                 placeholder="MM / YY"
                                 className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                 value={cardDetails.expiry}
                                 onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">CVV</label>
                              <input
                                 type="password"
                                 maxLength="3"
                                 placeholder="123"
                                 className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                 value={cardDetails.cvv}
                                 onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Card Holder Name</label>
                           <input
                              type="text"
                              placeholder="Name on card"
                              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                           />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                           <input type="checkbox" id="saveCard" className="rounded text-blue-500 focus:ring-blue-500" />
                           <label htmlFor="saveCard" className="text-sm text-gray-600">Securely save card for future payments</label>
                        </div>
                     </div>
                  )}
               </div>

               {/* Pay Button */}
               <div className="mt-auto pt-6 border-t border-gray-100">
                  <button
                     onClick={handlePay}
                     className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                  >
                     <FaLock className="text-sm cursor-pointer" /> Pay ₹{totalAmount.toFixed(2)}
                  </button>
                  <div className="text-center mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                     <FaLock className="text-[10px]" /> Secured by Cravyo Payments
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

const NavItem = ({ icon, label, subtext, active, onClick }) => (
   <button
      onClick={onClick}
      className={`w-full px-6 py-4 flex items-center gap-4 text-left transition-colors border-l-4 ${active
         ? 'bg-white border-blue-500 shadow-sm'
         : 'bg-transparent border-transparent hover:bg-gray-100'
         }`}
   >
      <div className={`text-xl ${active ? 'text-blue-500' : 'text-gray-400'}`}>{icon}</div>
      <div>
         <div className={`font-semibold ${active ? 'text-blue-600' : 'text-gray-700'}`}>{label}</div>
         {subtext && <div className="text-xs text-gray-400 mt-0.5 font-normal truncate max-w-30">{subtext}</div>}
      </div>
   </button>
);

const UpiAppButton = ({ icon, name, selected, onClick }) => (
   <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
         }`}
   >
      <div className="text-2xl">{icon}</div>
      <span className="font-medium text-gray-700 text-sm">{name}</span>
   </button>
);

export default PaymentGateway;