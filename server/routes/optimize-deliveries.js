const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { kmeans } = require('ml-kmeans');

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
  const result = kmeans(coordinates, numClusters);
    console.log("clusterAddresses called....")
  return result.clusters; // This will give you the index of the cluster for each address
}


function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1.latitude - point2.latitude, 2) + Math.pow(point1.longitude - point2.longitude, 2));
}

// Example adjustment to include address information
function optimizeRouteForCluster(clusterId, clusterAssignments, deliveryCoordinates, geocodedAddresses, warehouseLocation) {
  // Filter deliveryCoordinates to include only those in the current cluster
  const coordinatesForThisCluster = deliveryCoordinates.filter((_, index) => clusterAssignments[index] === clusterId);

  // Sort the coordinates by distance to the warehouse
  const sortedCoordinates = coordinatesForThisCluster.sort((a, b) => {
    const distanceA = calculateDistance(warehouseLocation, a);
    const distanceB = calculateDistance(warehouseLocation, b);
    return distanceA - distanceB; // Ascending order
  });

  // Map sorted coordinates back to addresses
  const sortedAddresses = sortedCoordinates.map(coord => {
    const addressIndex = deliveryCoordinates.findIndex(deliveryCoord => deliveryCoord[0] === coord[0] && deliveryCoord[1] === coord[1]);
    return geocodedAddresses[addressIndex + 1][0].formattedAddress; // +1 to account for the warehouse address being the first
  });

  return sortedAddresses;
}


router.post('/', async (req, res) => {
  const { deliveryAddresses, numClusters, warehouseLocation } = req.body;
  try {
    // Step 1: Geocode all addresses, including the warehouse
    const addressesToGeocode = [warehouseLocation, ...deliveryAddresses];
    const geocodedAddresses = await geocodeAddresses(addressesToGeocode);
    // Extract just the coordinates for clustering
    // Assuming you always want to use the first geocoding result for each address
    const coordinates = geocodedAddresses.map(addr => {
    if (addr.length > 0) { // Check if there are any geocoding results
      return [addr[0].latitude, addr[0].longitude];
    } else {
       return [undefined, undefined]; // Or handle this case differently
    }
   });
    // Step 2: Cluster the delivery addresses (excluding the warehouse, which is at index 0)
    const deliveryCoordinates = coordinates.slice(1); // Remove the warehouse location
    const clusterAssignments = clusterAddresses(deliveryCoordinates, numClusters);
    console.log("###")
    console.log(deliveryCoordinates)
    console.log(clusterAssignments)
    // Step 3: Optimize the route for each cluster
  // Assume warehouseLocation is defined somewhere in your code, e.g.,
  // const warehouseLocation = { latitude: 38.8425854, longitude: -77.270331 };

  const uniqueClusterIds = [...new Set(clusterAssignments)];
  const optimizedRoutes = await Promise.all(uniqueClusterIds.map(clusterId => 
    optimizeRouteForCluster(clusterId, clusterAssignments, deliveryCoordinates, geocodedAddresses, warehouseLocation)
  ));


    // Respond with the optimized routes
    res.json({ optimizedRoutes });
  } catch (error) {
    console.error('Failed to optimize routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;