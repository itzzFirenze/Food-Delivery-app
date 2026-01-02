const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true,
      unique: true
   },
   password: {
      type: String,
      required: true,
      select: false
   },
   phone: {
      type: String,
      required: true,
      unique: true
   },
   role: {
      type: String,
      enum: ['user', 'admin', 'restaurant_owner'],
      default: 'user'
   },
   restaurantOwnerApplication: {
      status: {
         type: String,
         enum: ['pending', 'approved', 'declined'],
      },
      appliedAt: Date,
      reviewedAt: Date,
      reviewedBy: { 
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'User' 
      }
   }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);