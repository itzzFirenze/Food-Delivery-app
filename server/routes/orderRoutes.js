const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");


// Get orders for a user
router.get('/', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;

      if (req.user.role !== 'admin' && req.user.id !== userId) {
         return res.status(403).json({ message: "Access denied" });
      }

      const orders = await Order.find({ userId }).populate('items.menuItem').sort({ createdAt: -1 });

      if (orders.length === 0) {
         return res.status(404).json({ message: "No orders found" });
      }

      return res.status(200).json({ data: orders });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Get all orders (Admin only)
router.get('/all-orders', verifyToken, async (req, res) => {
   try {
      if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Access denied" });
      }

      const orders = await Order.find()
         .populate('userId', 'name email')
         .populate('items.menuItem')
         .sort({ createdAt: -1 });

      if (orders.length === 0) {
         return res.status(404).json({ message: "No orders found" });
      }

      return res.status(200).json({
         count: orders.length,
         data: orders
      });

   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Get latest order (for auto-filling address)
router.get('/latest', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;

      const latestOrder = await Order.findOne({ userId })
         .sort({ createdAt: -1 })
         .select('deliveryAddress');

      if (!latestOrder) {
         return res.status(404).json({ message: "No previous orders found" });
      }

      return res.status(200).json({
         data: {
            deliveryAddress: latestOrder.deliveryAddress
         }
      });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Get single order
router.get("/:orderId", verifyToken, async (req, res) => {
   try {
      const order = await Order.findById(req.params.orderId).populate("items.menuItem");

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
         return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json({ data: order });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Function to update order status automatically
const updateOrderStatus = async (orderId) => {
   try {
      // Confirmed
      setTimeout(async () => {
         await Order.findByIdAndUpdate(orderId, { status: 'Confirmed' });
         console.log(`Order ${orderId} status updated to Confirmed`);
      }, 20000);

      // Preparing
      setTimeout(async () => {
         await Order.findByIdAndUpdate(orderId, { status: 'Preparing' });
         console.log(`Order ${orderId} status updated to Preparing`);
      }, 30000);

      // Out for Delivery
      setTimeout(async () => {
         await Order.findByIdAndUpdate(orderId, { status: 'Out for Delivery' });
         console.log(`Order ${orderId} status updated to Out for Delivery`);
      }, 90000);

      // Delivered
      setTimeout(async () => {
         await Order.findByIdAndUpdate(orderId, { status: 'Delivered' });
         console.log(`Order ${orderId} status updated to Delivered`);
      }, 270000);
   } catch (error) {
      console.error('Error updating order status:', error);
   }
};

// Place order
router.post('/', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;

      if (req.user.id !== userId) {
         return res.status(403).json({ message: "Access denied" });
      }

      const { paymentMethod, deliveryAddress, couponCode } = req.body;
      const cart = await Cart.findOne({ userId }).populate('items.menuItem');

      if (!cart || cart.items.length === 0) {
         return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate subtotal
      let subtotal = cart.items.reduce((acc, item) => {
         return acc + item.menuItem.price * item.quantity;
      }, 0);

      let discount = 0;
      let appliedCoupon = null;
      if (couponCode) {
         const coupon = await Coupon.findOne({ code: couponCode });
         if (!coupon) {
            return res.status(400).json({ message: "Invalid coupon code" });
         }
         if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: "Coupon expired" });
         }
         if (subtotal < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order ${coupon.minOrderAmount} required` });
         }

         // Calculate discount
         if (coupon.discountType === 'percentage') {
            discount = subtotal * (coupon.discountValue / 100);
         } else {
            discount = coupon.discountValue;
         }
         appliedCoupon = coupon.code;
      }

      // Calculate tax and delivery fee
      const tax = subtotal * 0.05; // 5% tax
      const deliveryFee = 40;

      // Calculate total amount
      const totalAmount = subtotal + tax + deliveryFee - discount;

      const newOrder = new Order({
         userId,
         items: cart.items.map(item => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity,
            price: item.menuItem.price
         })),
         totalAmount,
         paymentMethod,
         deliveryAddress,
         coupon: appliedCoupon
      });
      await newOrder.save();

      // Start automatic status updates
      updateOrderStatus(newOrder._id);

      cart.items = [];
      await cart.save();

      return res.status(200).json({ message: "Order placed successfully", data: newOrder });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Cancel order (admin or user)
router.patch('/:orderId/cancel', verifyToken, async (req, res) => {
   try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
         return res.status(403).json({ message: "Access denied" });
      }

      if (['Delivered', 'Cancelled', 'Out for Delivery'].includes(order.status)) {
         return res.status(400).json({ message: `Cannot cancel order with status ${order.status}` });
      }

      order.status = 'Cancelled';
      await order.save();
      return res.status(200).json({ message: "Order cancelled", data: order });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})


module.exports = router;