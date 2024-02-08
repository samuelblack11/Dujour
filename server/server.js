const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Change 3001 to your preferred port
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Add this line to define 'Schema'
const cors = require('cors');
app.use(cors());

// Middleware to handle JSON requests
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fleetware', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to fleetware database...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const farmSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: String, // Optional
  emailAddress: String, // Optional
});

const Farm = mongoose.model('Farm', farmSchema);


// Fetch all available items
app.get('/api/farms', async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (error) {
    res.status(500).send('Error fetching available items');
  }
});


app.post('/api/farms', async (req, res) => {
    const farm = new Farm(req.body); // Assuming Farm is your mongoose model for farms
    try {
        await farm.save();
        res.status(201).send(farm);
    } catch (error) {
        console.error('Error adding farm:', error);
        res.status(500).send('Server error');
    }
});

const availableItemSchema = new mongoose.Schema({
  itemName: String,
  quantityAvailable: Number,
  unitCost: Number, // Adding unitCost to the schema
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
});


const AvailableItem = mongoose.model('AvailableItem', availableItemSchema, 'availableItems');


// Fetch all available items
app.get('/api/items', async (req, res) => {
  try {
    const items = await AvailableItem.find().populate('farm');
    console.log(items)
    res.json(items);
  } catch (error) {
    res.status(500).send('Error fetching available items');
  }
});

// Assuming req.body.farm contains the ObjectId of the farm
app.post('/api/items', async (req, res) => {
  const item = new AvailableItem(req.body); // Now expects req.body to include a farm ObjectId
  try {
    await item.save();
    res.send('Item data saved to MongoDB with farm reference');
  } catch (error) {
    res.status(500).send('Error saving item data with farm reference');
  }
});

app.put('/api/items/:id', async (req, res) => {
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

app.delete('/api/items/:id', async (req, res) => {
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

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true, required: true },
  lastOrderNumber: { type: Number, default: 0 } // Tracks the last order number for the user
});

const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  customerName: String,
  orderNumber: Number,
  customerEmail: String,
  deliveryAddress: String,
  deliveryDate: Date,
  status: { type: String, default: 'draft' },
  items: [{
    itemName: String,
    quantity: Number,
    pickupAddress: String,
    unitCost: Number,
  }],
  totalCost: { type: Number, default: 0 },
});

orderSchema.pre('save', function(next) {
  let total = 0;
  this.items.forEach(item => {
    total += item.quantity * item.unitCost;
  });
  this.totalCost = total;
  next();
});

const Order = mongoose.model('Order', orderSchema, 'orders');


app.post('/api/orders', async (req, res) => {
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
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).send('Error fetching orders');
  }
});

// Driver Schema
const driverSchema = new mongoose.Schema({
  Name: String,
  Address: String,
  LicenseNumber: String,
  LicenseExpiration: Date,
  PhoneNumber: String,
  Email: String,
  EmergencyContact: String,
  DateOfHiring: Date,
  Position: String,
  Department: String,
  DrivingRecord: String,
  TrainingRecords: String,
  StandardVehicleAssignment: String,
  PerformanceReviews: String
});
const Driver = mongoose.model('Driver', driverSchema);
// Driver routes
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).send('Error fetching drivers');
  }
});

app.post('/api/drivers', async (req, res) => {
  const driver = new Driver(req.body);
  try {
    await driver.save();
    res.send('Driver data saved to MongoDB');
  } catch (error) {
    res.status(500).send('Error saving driver data');
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).send('Error updating driver');
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.send('Driver deleted successfully');
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).send('Error deleting driver');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
