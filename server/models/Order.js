const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   items: [
      {
         menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
         },
         quantity: {
            type: Number,
            required: true,
            default: 1
         },
         price: {
            type: Number,
            required: true
         }
      }
   ],
   totalAmount: {
      type: Number,
      required: true
   },
   coupon: {
      type: String,
   },
   status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending'
   },
   paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'Online Payment'],
      required: true
   },
   deliveryAddress: {
      street: {
         type: String,
         required: true
      },
      city: {
         type: String,
         required: true
      },
      zipCode: {
         type: String,
         required: true
      }
   }
}, {
   timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);