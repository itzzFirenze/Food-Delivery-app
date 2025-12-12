const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
   code: {
      type: String,
      required: true,
      unique: true
   },
   discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true
   },
   discountValue: {
      type: Number,
      required: true
   },
   minOrderAmount: {
      type: Number,
      default: 0
   },
   expiryDate: {
      type: Date,
      required: true
   },
   usageLimit: {
      type: Number,
      default: 1
   }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
