const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/api/orders', async (req, res) => {
  const order = new Order(req.body);

  try {
    // Save the order first to ensure it's valid and can be processed
    await order.save();

    // After saving the order, adjust the inventory for each ordered item
    for (const item of order.items) {
      await AvailableItem.findOneAndUpdate(
        { itemName: item.itemName },
        { $inc: { quantityAvailable: -item.quantity } },
        { new: true }
      );
    }

    res.send('Order data saved to MongoDB and inventory updated.');
  } catch (error) {
    res.status(500).send('Error processing order or updating inventory');
  }
});

// Fetch all orders
router.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
});

module.exports = router;