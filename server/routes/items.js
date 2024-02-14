const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Fetch all available items
router.get('/api/items', async (req, res) => {
  try {
    const items = await AvailableItem.find().populate('farm');
    console.log(items)
    res.json(items);
  } catch (error) {
    res.status(500).send('Error fetching available items');
  }
});

// Assuming req.body.farm contains the ObjectId of the farm
router.post('/api/items', async (req, res) => {
  const item = new AvailableItem(req.body); // Now expects req.body to include a farm ObjectId
  try {
    await item.save();
    res.send('Item data saved to MongoDB with farm reference');
  } catch (error) {
    res.status(500).send('Error saving item data with farm reference');
  }
});

router.put('/api/items/:id', async (req, res) => {
  console.log("Updating item with ID:", req.params.id);
  console.log("New data:", req.body);
  try {
    const updatedItem = await AvailableItem.findByIdAndUpdate(
      req.params.id,
      req.body, // Update all fields sent in the request body
      { new: true }
    ).populate('farm'); // Optionally populate 'farm' to return updated item with farm details
    res.json(updatedItem);
  } catch (error) {
    res.status(500).send('Error updating item: ' + error.message);
  }
});

router.delete('/api/items/:id', async (req, res) => {
    try {
        const deletedItem = await AvailableItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).send('Item not found');
        }
        res.send('Item deleted successfully');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item');
    }
});

module.exports = router;
