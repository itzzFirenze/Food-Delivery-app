const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const restaurantRoutes = require('./routes/restaurantRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/orders', orderRoutes);
app.use('/coupons', couponRoutes);

async function main() {
   try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected Successfully");
   } catch (error) {
      console.error("MongoDB Connection Error:", error);
   }
}

main();

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
})