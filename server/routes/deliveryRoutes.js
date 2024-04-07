const express = require('express');
const router = express.Router();
const DeliveryRoute = require('../models/DeliveryRoute'); // Ensure this path matches where your Route model is saved


// PUT endpoint to update driver assignments for routes
router.put('/updateDrivers', async (req, res) => {
    const { date, updatedRoutes } = req.body;

    try {
        // Loop through each route in updatedRoutes and update the database
        for (let updatedRoute of updatedRoutes) {
            await DeliveryRoute.updateOne(
                { _id: updatedRoute._id }, // Assuming each route has a unique _id
                { $set: { driverId: updatedRoute.driverId } } // Update the driverId
            );
        }

        res.status(200).json({ message: "Driver assignments updated successfully." });
    } catch (error) {
        console.error('Failed to update driver assignments:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
  const { routes } = req.body;

  try {
  const transformedRoutes = routes.map(route => {
    const { startTime, stops } = route;
    const transformedStops = stops.map(stop => ({
      // Ensure this matches your frontend submission structure
      address: stop.address,
      customerEmail: stop.customerEmail,
      orderNumber: stop.orderNumber
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

      const existingRoutes = await DeliveryRoute.find({
          startTime: {
              $gte: startOfEstDay,
              $lte: endOfEstDay
          }
      });
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

module.exports = router;
