const express = require('express');
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const verifyToken = require('../middleware/auth');

// -- RESTAURANT --

// Get all restaurants
router.get('/', async (req, res) => {
   try {
      const restaurants = await Restaurant.find();

      if (restaurants.length === 0) {
         return res.status(404).json({ message: "No restaurants found" });
      }

      return res.status(200).json({ data: restaurants })
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Get restaurant by id
router.get('/:id', async (req, res) => {
   try {
      const restaurant = await Restaurant.findById(req.params.id);

      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      return res.status(200).json({ data: restaurant });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Create new restaurant (admin or restaurant owner)
router.post('/', verifyToken, async (req, res) => {
   try {
      const { name, address, image, isVeg } = req.body;

      if (!name || !address || !image) {
         return res.status(400).json({ error: "All fields are required" });
      }

      if (req.user.role !== 'admin' && req.user.role !== 'restaurant_owner') {
         return res.status(403).json({ message: "Access denied" });
      }

      const owner = req.user.id;

      const newRestaurant = new Restaurant({
         name,
         address,
         isVeg,
         image,
         owner
      });
      await newRestaurant.save();
      return res.status(201).json({ message: "Restaurant created successfully", data: newRestaurant });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Update restaurant (admin or restaurant owner)
router.patch('/:id', verifyToken, async (req, res) => {
   try {
      const id = req.params.id;
      const { name, address, image, isVeg } = req.body;

      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      if (req.user.role !== 'admin' && req.user.id !== restaurant.owner.toString()) {
         return res.status(403).json({ message: "Access denied" });
      }

      if (!name || !address || !image) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const updatedRestaurant = await Restaurant.findOneAndUpdate(
         {
            _id: id
         },
         {
            name,
            address,
            isVeg,
            image
         },
         {
            new: true
         }
      );
      return res.status(200).json({ message: "Restaurant updated successfully", data: updatedRestaurant });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Delete restaurant (admin or restaurant owner)
router.delete('/:id', verifyToken, async (req, res) => {
   try {
      const id = req.params.id;

      // Find the restaurant first (without deleting)
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
         return res.status(404).json({ message: `Restaurant with id ${id} not found` });
      }

      // Check permissions BEFORE deleting
      if (req.user.role !== 'admin' && req.user.id !== restaurant.owner.toString()) {
         return res.status(403).json({ message: "Access denied" });
      }

      // Now delete the restaurant
      await Restaurant.findByIdAndDelete(id);

      return res.status(200).json({ message: `Restaurant with id ${id} deleted successfully` });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
});

// -- MENU --

// Get menu for a restaurant
router.get('/:id/menu', async (req, res) => {
   try {
      const id = req.params.id;
      const menuItems = await MenuItem.find({ restaurantId: id });

      if (menuItems.length === 0) {
         return res.status(404).json({ message: "No menu items found for this restaurant" });
      }

      return res.status(200).json({ data: menuItems });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Add menu item to a restaurant (admin or restaurant owner)
router.post('/:id/menu', verifyToken, async (req, res) => {
   try {
      const id = req.params.id;
      const { title, description, price, category, image, veg } = req.body;
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      if (req.user.role !== 'admin' && req.user.id !== restaurant.owner.toString()) {
         return res.status(403).json({ message: "Access denied" });
      }

      if (!title || !price || !category) {
         return res.status(400).json({ error: "Title, price and category are required" });
      }


      const newMenuItem = new MenuItem({
         restaurantId: id,
         title,
         description,
         price,
         category,
         veg,
         image
      })
      await newMenuItem.save();
      return res.status(201).json({ message: "Menu item added successfully", data: newMenuItem });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})


// Update menu item for a restaurant (admin or restaurant owner)
router.patch('/:restaurantId/menu/:menuItemId', verifyToken, async (req, res) => {
   try {
      const { restaurantId, menuItemId } = req.params;
      const { title, description, price, category, image, veg } = req.body;

      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      if (req.user.role !== 'admin' && req.user.id !== restaurant.owner.toString()) {
         return res.status(403).json({ message: "Access denied" });
      }

      // if (!title || !price || !category) {
      //    return res.status(400).json({ error: "Title, price and category are required" });
      // }

      const updatedMenuItem = await MenuItem.findOneAndUpdate(
         {
            _id: menuItemId,
            restaurantId: restaurantId
         },
         {
            title,
            description,
            price,
            category,
            veg,
            image
         },
         {
            new: true
         }
      );

      if (!updatedMenuItem) {
         return res.status(404).json({ message: "Menu item not found for this restaurant" });
      }

      return res.status(201).json({ message: "Menu item updated successfully", data: updatedMenuItem });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// Delete menu item from a restaurant (admin or restaurant)
router.delete('/:restaurantId/menu/:menuItemId', verifyToken, async (req, res) => {
   try {
      const { restaurantId, menuItemId } = req.params;
      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      if (req.user.role !== 'admin' && req.user.id !== restaurant.owner.toString()) {
         return res.status(403).json({ message: "Access denied" });
      }

      const deletedMenuItem = await MenuItem.findOneAndDelete({ _id: menuItemId, restaurantId: restaurantId });

      if (!deletedMenuItem) {
         return res.status(404).json({ message: "Menu item not found for this restaurant" });
      }

      return res.status(200).json({ message: "Menu item deleted successfully" });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})


module.exports = router;