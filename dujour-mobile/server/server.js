require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://dujour-mobile.azurewebsites.net' : '*',
};
app.use(cors(corsOptions));

//Test 1234567
const port = process.env.PORT || 3004;

const encodedUsername = encodeURIComponent(process.env.mongoUserName);
const encodedPassword = encodeURIComponent(process.env.mongoPwd);

// MongoDB connection
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${process.env.mongoClusterName}.mongodb.net/Dujour?retryWrites=true&w=majority&appName=${process.env.databaseName}`;
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
const orderRoutes = require('dujour-shared/routes/orders');
const userRoutes = require('dujour-shared/routes/users');
const deliveryRoutes = require('dujour-shared/routes/deliveryRoutes');
const pickPlans = require('dujour-shared/routes/pickPlans');

// Mount routes to the API router
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/deliveryRoutes', deliveryRoutes);
apiRouter.use('/pickPlans', pickPlans);

{/*app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {  // "finish" event is emitted when the response has been sent
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});*/}


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

