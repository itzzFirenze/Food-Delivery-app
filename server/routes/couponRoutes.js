const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Admin: Create new coupon
router.post('/', async (req, res) => {
   try {
      const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;
      if (!code || !discountType || !discountValue || !expiryDate) {
         return res.status(400).json({ message: "Required fields missing" });
      }

      const coupon = new Coupon({ code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit });
      await coupon.save();

      res.status(201).json({ message: "Coupon created", data: coupon });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Admin: Get all coupons
router.get('/', async (req, res) => {
   try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      res.status(200).json({ data: coupons });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

// Validate coupon for checkout (optional, can also be done inside place order)
router.get('/validate/:code', async (req, res) => {
   try {
      const { code } = req.params;
      const coupon = await Coupon.findOne({ _id: code });
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      if (coupon.expiryDate < new Date()) return res.status(400).json({ message: "Coupon expired" });

      res.status(200).json({ message: "Coupon valid", data: coupon });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
});

module.exports = router;