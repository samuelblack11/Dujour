require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
//Test 123456
const port = process.env.PORT || 3004;

const encodedUsername = encodeURIComponent(process.env.mongoUserName);
const encodedPassword = encodeURIComponent(process.env.mongoPwd);

// MongoDB connection
const uri = `mongodb+srv://${encodedUsername}:${encodedPassword}@${process.env.mongoClusterName}.mongodb.net/Dujour?retryWrites=true&w=majority&appName=${process.env.databaseName}`;
console.log("^^^^^^")
console.log(uri)
mongoose.connect(uri, { useNewUrlParser: true})
  .then(() => console.log('Connected to database...'))
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
  });

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
const orderRoutes = require('dujour-shared/routes/orders');
const userRoutes = require('dujour-shared/routes/users');
const deliveryRoutes = require('dujour-shared/routes/deliveryRoutes');
const pickPlans = require('dujour-shared/routes/pickPlans');

app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deliveryRoutes', deliveryRoutes);
app.use('/api/pickPlans', pickPlans);

// Catch-all handler for React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
