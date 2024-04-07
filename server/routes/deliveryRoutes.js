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


// Assuming you have a field like `date` or you use `startTime` in your schema to store the date
router.get('/', async (req, res) => {
    const { date } = req.query; // Get the date from query parameters

    try {
      // Assuming 'date' is in "YYYY-MM-DD" format and represents an EST date
      const startOfEstDay = new Date(`${date}T00:00:00-05:00`); // Start of day in EST, adjust offset as needed for EDT
      const endOfEstDay = new Date(`${date}T23:59:59-05:00`); // End of day in EST

      console.log(`Start of day in EST (converted to UTC): ${startOfEstDay.toISOString()}, End of day in EST (converted to UTC): ${endOfEstDay.toISOString()}`);

      const existingRoutes = await DeliveryRoute.find({
          startTime: {
              $gte: startOfEstDay,
              $lte: endOfEstDay
          }
      });
        console.log(`Found ${existingRoutes.length} existing routes for the date.`);

        if (existingRoutes.length > 0) {
            res.json({ exists: true, routes: existingRoutes });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking for existing route plans:', error);
        res.status(500).send('Error finding route plans');
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
