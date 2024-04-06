const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const Kmeans = require('ml-kmeans');

// Example using Express.js
const maxRouteTime = 2 * 60 * 60; // Maximum route time in seconds (2 hours)
const dropOffTimePerAddress = 4 * 60; // Drop-off time per address in seconds (4 minutes)
const pickUpTime = '6:00 AM'; // Constant pickup time
const loadingTime = 15 * 60; // Loading time in seconds (15 minutes)

const options = {
  provider: 'openstreetmap' // Or 'google', 'here', etc., depending on the service
  // If using a provider that requires an API key, add apiKey: 'YOUR_API_KEY' here
};
const geocoder = NodeGeocoder(options);
async function geocodeAddresses(addresses) {
    console.log("geocodeAddresses called....")
  return Promise.all(addresses.map(address => geocoder.geocode(address)));
}

function clusterAddresses(coordinates, numClusters) {
  const numClusterOptions = { k: numClusters }; // Specify the number of clusters
  const result = Kmeans(coordinates, numClusterOptions);
    console.log("clusterAddresses called....")
  return result.clusters; // This will give you the index of the cluster for each address
}

async function optimizeRouteForCluster(clusterCoordinates) {
  // Assuming you have a function to call your chosen route optimization API
  const optimizedRoute = await callRouteOptimizationAPI(clusterCoordinates);
  console.log("optimizzedRoutesForCluster called....")
  return optimizedRoute;
}

router.post('/', async (req, res) => {
  const { deliveryAddresses, numClusters, warehouseLocation } = req.body;
console.log("&&&")
  try {
    // Step 1: Geocode all addresses, including the warehouse
    const addressesToGeocode = [warehouseLocation, ...deliveryAddresses];
    const geocodedAddresses = await geocodeAddresses(addressesToGeocode);
    console.log("^^^")
    console.log(geocodedAddresses)
    // Extract just the coordinates for clustering
    const coordinates = geocodedAddresses.map(addr => [addr.latitude, addr.longitude]);

    // Step 2: Cluster the delivery addresses (excluding the warehouse, which is at index 0)
    const deliveryCoordinates = coordinates.slice(1); // Remove the warehouse location
    const clusters = clusterAddresses(deliveryCoordinates, numClusters);
    console.log("###")
    console.log(clusters)

    // Step 3: Optimize the route for each cluster
    const optimizedRoutes = await Promise.all(clusters.map(cluster => 
      optimizeRouteForCluster(cluster)
    ));

    // Respond with the optimized routes
    res.json({ optimizedRoutes });
  } catch (error) {
    console.error('Failed to optimize routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;