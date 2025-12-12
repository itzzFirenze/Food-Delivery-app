const express = require('express');
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

// get all restaurants
router.get('/', async (req, res) => {
   try {
      const restuarants = await Restaurant.find({});

      if (!restuarants) {
         return res.status(404).json({ message: "No restaurants found" });
      }

      return res.status(200).json({ data: restuarants })
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// get restaurant by id
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

// create new restaurant
router.post('/', async (req, res) => {
   try {
      const { name, address, image, owner } = req.body;

      if (!name || !address || !image || !owner) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const newRestaurant = new Restaurant({
         name,
         address,
         image,
         owner
      });
      await newRestaurant.save();
      return res.status(201).json({ message: "Restaurant created successfully", data: newRestaurant });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// update restaurant
router.put('/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const { name, address, image, owner } = req.body;

      if (!name || !address || !image || !owner) {
         return res.status(400).json({ error: "All fields are required" });
      }

      const updatedRestaurant = await Restaurant.findOneAndUpdate(
         {
            _id: id
         },
         {
            name,
            address,
            image,
            owner
         },
         {
            new: true
         }
      );
      return res.status(201).json({ message: "Restaurant created successfully", data: updatedRestaurant });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// delete resutaurant
router.delete('/:id', async (req, res) => {
   try {
      const id = req.params.id;
      const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

      if (!deletedRestaurant) {
         return res.status(404).json({ message: `Restaurant with id ${reqid} not found` })
      }

      return res.status(200).json({ message: `Restaurant with id ${id} deleted successfully` });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// -- MENU --

// get menu for a restaurant
router.get('/:id/menu', async (req, res) => {
   try {
      const id = req.params.id;
      const menuItems = await MenuItem.find({ restaurantId: id });

      if (!menuItems) {
         return res.status(404).json({ message: "No menu items found for this restaurant" });
      }

      return res.status(200).json({ data: menuItems });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// add menu item to a restaurant
router.post('/:id/menu', async (req, res) => {
   try {
      const id = req.params.id;
      const { title, description, price, category, image } = req.body;

      if (!title || !price || !category) {
         return res.status(400).json({ error: "Title, price and category are required" });
      }

      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
         return res.status(404).json({ message: "Restaurant not found" });
      }

      const newMenuItem = new MenuItem({
         restaurantId: id,
         title,
         description,
         price,
         category,
         image
      })
      await newMenuItem.save();
      return res.status(201).json({ message: "Menu item added successfully", data: newMenuItem });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// delete menu item from a restaurant
router.delete('/:restaurantId/menu/:menuItemId', async (req, res) => {
   try {
      const { restaurantId, menuItemId } = req.params;
      const deletedMenuItem = await MenuItem.findOneAndDelete({ _id: menuItemId, restaurantId: restaurantId });

      if (!deletedMenuItem) {
         return res.status(404).json({ message: "Menu item not found for this restaurant" });
      }

      return res.status(200).json({ message: "Menu item deleted successfully" });
   } catch (error) {
      return res.status(500).json({ message: error.message });
   }
})

// update menu item for a restaurant
router.put('/:restaurantId/menu/:menuItemId', async (req, res) => {
   try {
      const { restaurantId, menuItemId } = req.params;
      const { title, description, price, category, image } = req.body;

      if (!title || !price || !category) {
         return res.status(400).json({ error: "Title, price and category are required" });
      }

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

module.exports = router;