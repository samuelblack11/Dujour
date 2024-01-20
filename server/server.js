const express = require('express');
const app = express();
const port = 5000; // You can choose any port that's not in use

// Middleware to handle JSON requests
app.use(express.json());

// Define your API routes here
// Example: app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
