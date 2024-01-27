const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Change 3001 to your preferred port
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fleetware', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to fleetware database...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const cargoSchema = new mongoose.Schema({
  customerName: String,
  customerEmail: String,
  cargoLength: Number,
  cargoWidth: Number,
  cargoHeight: Number,
  cargoWeight: Number,
  cargoCategory: String,
  cargoHazardous: String,
  cargoValue: Number,
  pickupAddress: String,
  deliveryAddress: String,
  deliveryDate: Date,
  deliveryStatus: String,
});

const Cargo = mongoose.model('Cargo', cargoSchema, 'cargo');

const cargoCategorySchema = new mongoose.Schema({
  key: String,
  value: String
});
const CargoCategories = mongoose.model('CargoCategories', cargoCategorySchema, 'cargoCategories');


// Middleware to handle JSON requests
app.use(express.json()); // Middleware to parse JSON bodies

app.post('/api/cargo', async (req, res) => {
  const cargo = new Cargo(req.body);

  try {
    await cargo.save();
    console.log("Cargo data saved successfully:", cargo);
    res.send('Cargo data saved to MongoDB');
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send('Error saving data');
  }
});

// Endpoint to update a cargo entry
app.put('/api/cargo/:id', async (req, res) => {
  try {
    const updatedCargo = await Cargo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCargo);
  } catch (error) {
    console.error('Failed to update cargo:', error);
    res.status(500).send('Error updating cargo');
  }
});


app.get('/api/cargoCategories', async (req, res) => {
  try {
    const categories = await CargoCategories.find();
    res.json(categories);
  } catch (error) {
    res.status(500).send("Error retrieving cargo categories");
  }
});


// Fetch all cargo entries
app.get('/api/cargo', async (req, res) => {
  try {
    const cargoEntries = await Cargo.find();
    res.json(cargoEntries);
  } catch (error) {
    res.status(500).send('Error fetching cargo entries');
  }
});

// Delete a specific cargo entry
app.delete('/api/cargo/:id', async (req, res) => {
  try {
    await Cargo.findByIdAndDelete(req.params.id);
    res.send('Cargo entry deleted');
  } catch (error) {
    res.status(500).send('Error deleting cargo entry');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
