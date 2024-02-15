const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

// Fetch all available items
router.get('/', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (error) {
    res.status(500).send('Error fetching available items');
  }
});


router.post('/', async (req, res) => {
    const farm = new Farm(req.body); // Assuming Farm is your mongoose model for farms
    try {
        await farm.save();
        res.status(201).send(farm);
    } catch (error) {
        console.error('Error adding farm:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
