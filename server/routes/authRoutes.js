const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/User");

// Register
router.post('/register', async (req, res) => {
   try {
      const { name, email, password, phone, role } = req.body;

      if (!name || !email || !password || !phone) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
         name,
         email,
         password: hashedPassword,
         phone,
         role: role || "user"
      });
      await newUser.save();
      return res.status(201).json({ message: "User registered successfully", data: newUser });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Login
router.post('/login', async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
         return res.status(400).json({ error: "User doesn't exist" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
         return res.status(400).json({ error: "Invalid user crendentials" });
      }

      const token = jwt.sign(
         { id: user._id, role: user.role },
         process.env.JWT_SECRET,
         { expiresIn: '7d' }
      );

      res.status(200).json({
         message: "Login successful",
         token
      });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
})

module.exports = router;