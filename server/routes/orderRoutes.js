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

      let totalAmount = cart.items.reduce((acc, item) => {
         return acc + item.menuItem.price * item.quantity;
      }, 0);

      let appliedCoupon = null;
      if (couponCode) {
         const coupon = await Coupon.findOne({ code: couponCode });
         if (!coupon) {
            return res.status(400).json({ message: "Invalid coupon code" });
         }
         if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: "Coupon expired" });
         }
         if (totalAmount < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order ${coupon.minOrderAmount} required` });
         }

         // Apply discount
         if (coupon.discountType === 'percentage') {
            totalAmount = totalAmount * (1 - coupon.discountValue / 100);
         } else {
            totalAmount = totalAmount - coupon.discountValue;
         }
         appliedCoupon = coupon.code;
      }

      const newOrder = new Order({
         userId,
         items: cart.items.map(item => ({
            menuItem: item.menuItem._id,
            quanity: item.quantity,
            price: item.menuItem.price
         })),
         totalAmount,
         paymentMethod,
         deliveryAddress,
         coupon: appliedCoupon
      });
      await newOrder.save();
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

      if (['Delivered', 'Cancelled'].includes(order.status)) {
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