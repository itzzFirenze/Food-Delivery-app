const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   address: {
      type: String,
      required: true
   },
   isVeg: {
      type: Boolean,
      required: true
   },
   image: {
      type: String,
      required: true
   },
   owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   }
}, { timestamps: true })

module.exports = mongoose.model('Restaurant', restaurantSchema);