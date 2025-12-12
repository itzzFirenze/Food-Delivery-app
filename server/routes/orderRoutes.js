const express = require('express');
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

// -- CART --

// get cart by user id
router.get('/:userId', async (req, res) => {
   try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ userId }).populate('items.menuItem');

      if (!cart) {
         return res.status(404).json({ message: "Cart is empty" });
      }

      return res.status(200).json({ data: cart });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// add item to cart
router.post('/:userId/add', async (req, res) => {
   try {
      const { userId } = req.params;
      const { menuItemId, quantity } = req.body;

      if (!menuItemId || !quantity) {
         return res.status(400).json({ error: "menuItemId and quantity are required" });
      }

      let cart = await Cart.findOne({ userId });

      // If no cart, create new cart
      if (!cart) {
         cart = new Cart({
            userId,
            items: [{ menuItem: menuItemId, quantity }]
         });
      } else {

         // Check if menu item already exists
         const itemIndex = cart.items.findIndex(
            item => item.menuItem.toString() === menuItemId
         );

         if (itemIndex > -1) {
            // update quantity
            cart.items[itemIndex].quantity += quantity;
         } else {
            // add new item
            cart.items.push({ menuItem: menuItemId, quantity });
         }
      }

      await cart.save();

      return res.status(200).json({
         message: "Item added to cart successfully",
         data: cart
      });

   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// update item quantity in cart
router.patch('/:userId/update', async (req, res) => {
   try {
      const { userId } = req.params;
      const { menuItemId, quantity } = req.body;

      if (!menuItemId || !quantity) {
         return res.status(400).json({ error: "menuItemId and quantity are required" });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
         return res.status(404).json({ message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
         item => item.menuItem.toString() === menuItemId
      );

      if (itemIndex === -1) {
         return res.status(404).json({ message: "Item not found in cart" });
      }

      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      return res.status(200).json({ message: "Quantity updated", data: cart });

   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// delete specific item from cart
router.delete('/:userId/delete/:itemId', async (req, res) => {
   try {
      const { userId, itemId } = req.params;
      const cart = await Cart.findOne({ userId });

      if (!cart) {
         return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = cart.items.filter(
         item => item._id.toString() !== itemId
      )

      await cart.save();
      return res.status(200).json({ message: "Item removed from cart", data: cart });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// delete entire cart
router.delete('/:userId/clear', async (req, res) => {
   try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
         return res.status(404).json({ message: "Cart not found" });
      }
      cart.items = [];
      await cart.save();
      return res.status(200).json({ message: "Cart cleared successfully" });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})


// -- ORDER --

// place order
router.post('/:userId', async (req, res) => {
   try {
      const { userId } = req.params;
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

module.exports = router;