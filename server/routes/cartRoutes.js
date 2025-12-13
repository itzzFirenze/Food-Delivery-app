const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Cart = require("../models/Cart");
const Coupon = require("../models/Coupon");

// Get cart for a user
router.get('/', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;
      const cart = await Cart.findOne({ userId }).populate('items.menuItem');

      if (!cart) {
         return res.status(404).json({ message: "Cart is empty" });
      }

      return res.status(200).json({ data: cart });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Add item to cart
router.post('/add', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;
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

// Update item quantity in cart
router.patch('/update', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;
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

// Delete specific item from cart
router.delete('/item/:itemId', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;
      const { itemId } = req.params;

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

// Clear entire cart
router.delete('/clear', verifyToken, async (req, res) => {
   try {
      const userId = req.user.id;
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

module.exports = router;