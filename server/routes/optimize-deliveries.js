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
  return Promise.all(addresses.map(address => geocoder.geocode(address)));
}

function clusterAddresses(coordinates, numClusters) {
  const result = kmeans(coordinates, numClusters);
  return result.clusters; // This will give you the index of the cluster for each address
}


function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1.latitude - point2.latitude, 2) + Math.pow(point1.longitude - point2.longitude, 2));
}

function optimizeRouteForCluster(clusterId, clusterAssignments, deliveryCoordinates, geocodedAddresses, warehouseLocation, addressToGeocodeMap) {
  console.log(`Optimizing Cluster: ${clusterId}`);
  
  // Filter deliveryCoordinates to include only those in the current cluster
  const coordinatesForThisCluster = deliveryCoordinates
    .map((coord, index) => ({ coord, index }))
    .filter(({ _, index }) => clusterAssignments[index] === clusterId)
    .map(({ coord }) => coord);

  // Print geocoded addresses for this cluster
  //console.log(`Geocoded Addresses for this Cluster: ${JSON.stringify(geocodedAddresses)}`);
  
  // Print coordinates for this cluster
  console.log(`Coordinates for this Cluster: ${JSON.stringify(coordinatesForThisCluster)}`);

  // Sort the coordinates by distance to the warehouse
  const sortedCoordinates = coordinatesForThisCluster.sort((a, b) => {
    const distanceA = calculateDistance(warehouseLocation, a);
    const distanceB = calculateDistance(warehouseLocation, b);
    return distanceA - distanceB; // Ascending order
  });

  // Print sorted coordinates for this cluster
  console.log(`Sorted Coordinates for this Cluster: ${JSON.stringify(sortedCoordinates)}`);

// After sorting coordinates for a cluster...
const sortedAddresses = sortedCoordinates.map(coord => {
  const geocodeResult = Array.from(addressToGeocodeMap.entries()).find(([_, geoResult]) =>
    geoResult.latitude === coord[0] && geoResult.longitude === coord[1]
  );

  return geocodeResult ? geocodeResult[0] : null; // Return the original address
});

  // Print sorted address for cluster
  console.log(`Sorted Address for Cluster # ${clusterId}`);
  console.log(`${sortedAddresses}`);
  console.log("------------------------------------");

  return sortedAddresses;
}

router.post('/', async (req, res) => {
  const { orders, numClusters, warehouseLocation } = req.body;

  try {
    const warehouseGeocode = await geocodeAddresses([warehouseLocation]);
    const warehouseCoordinates = warehouseGeocode[0].length > 0 
      ? [warehouseGeocode[0][0].latitude, warehouseGeocode[0][0].longitude]
      : [undefined, undefined];

    const addressesToGeocode = orders.map(order => order.deliveryAddress);
    const geocodedAddresses = await geocodeAddresses(addressesToGeocode);

    const addressToGeocodeMap = new Map();
    geocodedAddresses.forEach((geocodeResult, index) => {
      if (geocodeResult.length > 0) {
        const originalAddress = addressesToGeocode[index];
        addressToGeocodeMap.set(originalAddress, geocodeResult[0]);
      }
    });

    const coordinates = [warehouseCoordinates, ...geocodedAddresses.map(addr => addr.length > 0 ? [addr[0].latitude, addr[0].longitude] : [undefined, undefined])];
    const clusterAssignments = clusterAddresses(coordinates.slice(1), numClusters);

    console.log("------------------------------------");
    addressesToGeocode.forEach((address, index) => {
      const coord = coordinates[index];
      const clusterNumber = clusterAssignments[index];
      console.log(`Address: ${address}, Coordinates: ${coord}, Cluster Number: ${clusterNumber}`);
    });
    console.log("------------------------------------");

    const uniqueClusterIds = [...new Set(clusterAssignments)];
    const optimizedRoutes = await Promise.all(uniqueClusterIds.map(clusterId => 
      optimizeRouteForCluster(clusterId, clusterAssignments, coordinates.slice(1), geocodedAddresses, warehouseCoordinates, addressToGeocodeMap)
    ));

  const optimizedRoutesWithOrders = optimizedRoutes.map(route => {
    return route.map(address => {
        // Find the order that matches this address
        const order = orders.find(o => o.deliveryAddress === address);
        console.log("Found order:", order); // Verify the order structure
        console.log(order.customerEmail)
        console.log(order.orderNumber)
        // If a matching order is found, return an object with the desired details
        if (order) {
            return {
                customerEmail: order.customerEmail,
                orderNumber: order.orderNumber,
                address: order.deliveryAddress // Assuming you still want to include the address
            };
        }
        
        return null; // Return null if no matching order is found
    }).filter(detail => detail !== null); // Filter out any nulls to ensure only valid stops are included

});
console.log("Optimized routes with order details:", optimizedRoutesWithOrders);

res.json({ optimizedRoutes: optimizedRoutesWithOrders });

  } catch (error) {
    console.error('Failed to optimize routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;