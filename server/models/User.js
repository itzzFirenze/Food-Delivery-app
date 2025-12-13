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
   }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);