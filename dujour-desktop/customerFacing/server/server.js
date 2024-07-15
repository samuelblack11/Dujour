require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  // Import the 'path' module here
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://dujour-customer.azurewebsites.net' : '*',
};
app.use(cors(corsOptions));

const port = process.env.PORT || 3002; // Change 3001 to your preferred port
// Test comment 123
// URL encode the password to handle special characters
const encodedUsername = encodeURIComponent(process.env.mongoUserName);
const encodedPassword = encodeURIComponent(process.env.mongoPwd);

// Construct the MongoDB URI using imported configuration
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${process.env.mongoClusterName}.mongodb.net/Dujour?retryWrites=true&w=majority&appName=${process.env.databaseName}`

mongoose.connect(uri, { useNewUrlParser: true})
  .then(() => console.log('Connected to database...'))
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
  });

// Serve static files based on the environment
const staticPath = process.env.NODE_ENV === 'production' ? 
    path.join(__dirname, '../client/build') : 
    path.join(__dirname, '../client/public');
console.log(`Serving static files from ${staticPath}`);
app.use(express.static(staticPath));

const BASE_API_PATH = process.env.BASE_API_PATH || '/api';
// Create a router for all API routes
const apiRouter = express.Router();

// Import and use routes
const farmRoutes = require('dujour-shared/routes/farms');
const itemRoutes = require('dujour-shared/routes/items');
const orderRoutes = require('dujour-shared/routes/orders')({
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
});
const userRoutes = require('dujour-shared/routes/users');
const optimizeDeliveries = require('dujour-shared/routes/optimize-deliveries')({
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
});
const deliveryRoutes= require('dujour-shared/routes/deliveryRoutes');

apiRouter.use('/farms', farmRoutes);
apiRouter.use('/items', itemRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/optimize-deliveries', optimizeDeliveries);
apiRouter.use('/deliveryRoutes', deliveryRoutes);

// Then mount the API router
app.use(BASE_API_PATH, apiRouter);

// Catch-all handler for React app
app.get('*', (req, res) => {
  console.log(`Serving React app for route: ${req.path}`);
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
