const express = require('express');
const router = express.Router();
const User = require("../models/User");
const verifyToken = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
   try {
      if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Access denied" });
      }
      const users = (await User.find().select('-password').sort({ createdAt: -1 }));
      if (users.length === 0) {
         return res.status(404).json({ message: "No users found" });
      }
      return res.status(200).json({ data: users });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Get current user's own profile
router.get('/me', verifyToken, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ data: user });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Get specific user info (admin only)
router.get('/:id', verifyToken, async (req, res) => {
   try {
      if (req.user.role !== 'admin') {
         return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ data: user });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Update current user's own profile
router.patch('/me', verifyToken, async (req, res) => {
   try {
      const { name, email, phone, oldPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');
      if (!user) return res.status(404).json({ message: "User not found" });

      // Update normal fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;

      // Update password if requested
      if (oldPassword && newPassword) {
         const isMatch = await bcrypt.compare(oldPassword, user.password);
         if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
         }
         const hashedPassword = await bcrypt.hash(newPassword, 10);
         user.password = hashedPassword;
      } else if (oldPassword || newPassword) {
         return res.status(400).json({ message: "Provide both oldPassword and newPassword to update password" });
      }

      await user.save();

      const userObj = user.toObject();
      delete userObj.password; // remove password from response

      return res.status(200).json({ message: "User updated successfully", data: userObj });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});


// Update specific user (admin only)
// router.patch('/:id', verifyToken, async (req, res) => {
//    try {
//       if (req.user.role !== 'admin') {
//          return res.status(403).json({ message: "Access denied" });
//       }

//       const updates = req.body;

//       const user = await User.findByIdAndUpdate(req.params.id, updates, { 
//          new: true,
//          runValidators: true 
//       }).select('-password');

//       if (!user) {
//          return res.status(404).json({ message: "User not found" });
//       }
//       return res.status(200).json({ message: "User updated successfully", data: user });
//    } catch (error) {
//       return res.status(500).json({ message: error.message });
//    }
// });

// Delete own account
router.delete('/me', verifyToken, async (req, res) => {
   try {
      const user = await User.findByIdAndDelete(req.user.id);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "Account deleted successfully" });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// Delete user by ID (admin)
router.delete('/:id', verifyToken, async (req, res) => {
   try {
      const { id } = req.params;

      if (req.user.role !== 'admin' && req.user.id !== id) {
         return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User deleted successfully" });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

module.exports = router;