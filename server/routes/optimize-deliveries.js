const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { kmeans } = require('ml-kmeans');
const hclust = require('ml-hclust');
const ACO = require('aco-tsp');

// Example using Express.js
const maxRouteTime = 2 * 60 * 60; // Maximum route time in seconds (2 hours)
const dropOffTimePerAddress = 4 * 60; // Drop-off time per address in seconds (4 minutes)
const pickUpTime = '6:00 AM'; // Constant pickup time
const loadingTime = 15 * 60; // Loading time in seconds (15 minutes)

const options = {
  provider: 'openstreetmap' // Or 'google', 'here', etc., depending on the service
  // If using a provider that requires an API key, add apiKey: 'YOUR_API_KEY' here
};

router.post('/', async (req, res) => {
  const { orders, numClusters, warehouseLocation, method } = req.body;

  try {
    // Geocode warehouse location
    const warehouseGeocode = await geocodeAddresses([warehouseLocation]);
    const warehouseCoordinates = warehouseGeocode.length > 0 && warehouseGeocode[0].length > 0
      ? { latitude: warehouseGeocode[0][0].latitude, longitude: warehouseGeocode[0][0].longitude }
      : null;

    // Geocode order delivery addresses
    const addressesToGeocode = orders.map(order => order.deliveryAddress);
    const geocodedAddresses = await geocodeAddresses(addressesToGeocode);
    const coordinates = [warehouseCoordinates, ...geocodedAddresses.map(addr => ({
      latitude: addr[0].latitude, longitude: addr[0].longitude
    }))].filter(coord => coord != null);

    // Clustering based on selected method
    const clusterAssignments = clusterAddresses(coordinates, numClusters, method);

    // Map addresses to geocode results
    const addressToGeocodeMap = new Map();
    geocodedAddresses.forEach((geocodeResult, index) => {
      if (geocodeResult.length > 0) {
        const originalAddress = addressesToGeocode[index];
        addressToGeocodeMap.set(originalAddress, geocodeResult[0]);
      }
    });

    // Optimization per cluster
    const uniqueClusterIds = [...new Set(clusterAssignments)];
    const optimizedRoutes = await Promise.all(uniqueClusterIds.map(clusterId =>
      optimizeRouteForCluster(clusterId, clusterAssignments, coordinates, geocodedAddresses, warehouseCoordinates, addressToGeocodeMap)
    ));

    // Building response with order details
    const optimizedRoutesWithOrders = optimizedRoutes.map(route => {
      return route.map(address => {
        const order = orders.find(o => o.deliveryAddress === address);
        return order ? {
          customerEmail: order.customerEmail,
          orderNumber: order.orderNumber,
          address: order.deliveryAddress
        } : null;
      }).filter(detail => detail !== null);
    });

    console.log("Optimized routes with order details:", optimizedRoutesWithOrders);
    res.json({ optimizedRoutes: optimizedRoutesWithOrders });

  } catch (error) {
    console.error('Failed to optimize routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const geocoder = NodeGeocoder(options);
async function geocodeAddresses(addresses) {
  return Promise.all(addresses.map(address => geocoder.geocode(address)));
}

function clusterAddresses(coordinates, numClusters, method = 'kmeans') {
    let result;
    switch (method) {
        case 'kmeans':
            result = kmeans(coordinates, numClusters);
            return result.clusters; // k-means directly returns cluster indices
        case 'aco':
            const path = findOptimalPathWithACO(coordinates);
            return segmentPathIntoClusters(path, numClusters); // Adapt ACO result to match k-means output format
        case 'hierarchical':
            return hierarchicalClusterAddresses(coordinates, numClusters); // Assuming this is adapted similarly
        default:
            throw new Error('Unsupported clustering method');
    }
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

// Alternative methods for route optimization below

// Hierarchical Clustering builds a tree of clusters that can be split or merged based on distance thresholds.
function hierarchicalClusterAddresses(coordinates) {
    const clusters = hclust.agglomerative(coordinates, numClusters, 'ward');
    const indices = clusters.indices();
    return indices; // Flat array of cluster indices
}

// Ant Colony Optimization is a probabilistic techniguq for solving computational problems by finding good paths through graphs,
// it's inspired by the behavior of ants searching for food
// Function to use ACO to find an optimal path
function createGraphFromCoordinates(coordinates) {
    let graph = [];
    for (let i = 0; i < coordinates.length; i++) {
        graph[i] = [];
        for (let j = 0; j < coordinates.length; j++) {
            graph[i][j] = i !== j ? calculateDistance(coordinates[i], coordinates[j]) : 0;
        }
    }
    return graph;
}

function findOptimalPathWithACO(coordinates) {
    let aco = new ACO({
        alpha: 1, // influence of pheromone
        beta: 2, // influence of heuristic value
        q: 1, // total pheromone left on the trail by each ant
        rho: 0.5 // pheromone evaporation coefficient
    });
    const graph = createGraphFromCoordinates(coordinates);
    aco.setGraph(graph);
    aco.startAnts(100, 50, 'random');
    return aco.getBestPath(); // This returns the sequence of coordinates as an optimal path
}

function segmentPathIntoClusters(path, numClusters) {
    const clusterSize = Math.ceil(path.length / numClusters);
    let clusterAssignments = new Array(path.length);
    
    for (let clusterIndex = 0; clusterIndex < numClusters; clusterIndex++) {
        let start = clusterIndex * clusterSize;
        let end = Math.min(start + clusterSize, path.length);
        for (let i = start; i < end; i++) {
            clusterAssignments[path[i]] = clusterIndex;
        }
    }
    return clusterAssignments;
}

module.exports = router;