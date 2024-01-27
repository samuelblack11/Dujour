const express = require('express');
const app = express();
const port = process.env.PORT || 3001; // Change 3001 to your preferred port
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fleetware', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to fleetware database...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


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

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  Year: Number,
  Make: String,
  Model: String,
  VehicleType: String,
  Mileage: Number,
  VehicleStatus: String,
  LicensePlateNumber: String,
  VIN: String,
  OwnerOrCompanyName: String,
  ServiceHistory: String,
  InsuranceDetails: String,
  RegistrationPolicy: String,
  RegistrationExpiration: Date,
  GPSDeviceID: String,
  PurchaseDate: Date,
  PurchasePrice: Number,
  AssignedDriver: String
});
const Vehicle = mongoose.model('Vehicle', vehicleSchema);


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

// Vehicle routes
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).send('Error fetching vehicles');
  }
});

app.post('/api/vehicles', async (req, res) => {
  const vehicle = new Vehicle(req.body);
  try {
    await vehicle.save();
    res.send('Vehicle data saved to MongoDB');
  } catch (error) {
    res.status(500).send('Error saving vehicle data');
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

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).send('Error updating vehicle');
  }
});


app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.send('Vehicle deleted successfully');
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).send('Error deleting vehicle');
  }
});


























app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
