const express = require('express');
const router = express.Router();
const User = require("../models/User");

// get all users
router.get('/', async (req, res) => {
   try {
      const users = await User.find({});

      if (!users) {
         return res.status(404).json({ message: "No users found" });
      }
      return res.status(200).json({ data: users });
   } catch (error) {

   }
})

// get user by id
router.get('/:id', async (req, res) => {
   try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ data: user });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// create new user
router.post('/', async (req, res) => {
   try {
      const { name, email, password, phone, role } = req.body;

      if (!name || !email || !password || !phone) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const newUser = new User({
         name,
         email,
         password,
         phone,
         role: role || "user"
      })
      await newUser.save();
      return res.status(201).json({ message: "User created successfully", data: newUser });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

module.exports = router;