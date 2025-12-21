const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
   restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
   },
   title: {
      type: String,
      required: true
   },
   description: {
      type: String
   },
   price: {
      type: Number,
      required: true
   },
   category: {
      type: String,
      required: true
   },
   veg: {
      type: Boolean,
      required: true
   },
   image: {
      type: String
   }
})

module.exports = mongoose.model('MenuItem', menuItemSchema);