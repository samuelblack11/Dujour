const express = require('express');
const router = express.Router();
const DeliveryRoute = require('../models/DeliveryRoute'); // Ensure this path matches where your Route model is saved

router.post('/', async (req, res) => {
  const { routes } = req.body;

  try {
  const transformedRoutes = routes.map(route => {
    const { startTime, stops } = route;
    const transformedStops = stops.map(stop => ({
      // Ensure this matches your frontend submission structure
      address: stop.address,
      orderId: stop.orderId, // Directly use orderId as received
      // Optionally transform or include other fields as needed
    }));

    return {
      // Other route details...
      stops: transformedStops,
      startTime: new Date(startTime),
    };
  });

    // Iterate over transformedRoutes to save each to the database
    for (const route of transformedRoutes) {
      const deliveryRoute = new DeliveryRoute(route);
      await deliveryRoute.save();
    }

    res.send('Delivery routes data saved to MongoDB.');
  } catch (error) {
    console.error('Error processing routes:', error);
    res.status(500).send('Error processing route');
  }
});



// Fetch all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).send('Error fetching routes');
  }
});

// Example PUT route for updating a route with a driverId and possibly other changes
router.put('/:id', async (req, res) => {
  try {
    const updatedDeliveryRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDeliveryRoute) {
      return res.status(404).send('Route not found');
    }
    res.json(updatedDeliveryRoute);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).send('Error updating route');
  }
});

// Delete a route
router.delete('/:id', async (req, res) => {
    try {
        const deletedDeliveryRoute = await Route.findByIdAndDelete(req.params.id);
        if (!deletedDeliveryRoute) {
            return res.status(404).send('Route not found');
        }
        res.send('Route deleted successfully');
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).send('Error deleting route');
    }
});

module.exports = router;
