const express = require('express');
const router = express.Router();
const NodeGeocoder = require('node-geocoder');
const { kmeans } = require('ml-kmeans');
const hclust = require('ml-hclust');
const ACO = require('ant-colony-optimization/src/ants');

// Example using Express.js
const maxRouteTime = 2 * 60 * 60; // Maximum route time in seconds (2 hours)
const dropOffTimePerAddress = 4 * 60; // Drop-off time per address in seconds (4 minutes)
const pickUpTime = '6:00 AM'; // Constant pickup time
const loadingTime = 15 * 60; // Loading time in seconds (15 minutes)

// Example using Express.js
const options = {
  provider: 'openstreetmap'
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
    const coordinates = geocodedAddresses.map(addr => ({
      latitude: addr[0].latitude, longitude: addr[0].longitude
    }));

    // Clustering based on selected method
    const clusterAssignments = await clusterAddresses(coordinates, numClusters, method);
    console.log("----")
    console.log(clusterAssignments)
    // Optimization per cluster
    const uniqueClusterIds = [...new Set(clusterAssignments)]; // Get unique cluster IDs
    console.log("!!!!")
    console.log(uniqueClusterIds)
    const optimizedRoutes = await Promise.all(uniqueClusterIds.map(clusterId =>
      optimizeRouteForCluster(clusterId, clusterAssignments, coordinates, orders, warehouseCoordinates)
    ));
    console.log("----")
    console.log(optimizedRoutes)
    // Build response with order details
    const optimizedRoutesWithOrders = optimizedRoutes.filter(route => route.length > 0);
    res.json({ optimizedRoutes: optimizedRoutesWithOrders });

  } catch (error) {
    console.error('Failed to optimize routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function geocodeAddresses(addresses) {
  const geocoder = NodeGeocoder(options);
  return Promise.all(addresses.map(address => geocoder.geocode(address)));
}

async function clusterAddresses(coordinates, numClusters, method) {
  switch (method) {
    case 'kmeans':
      const points = coordinates.map(coord => [coord.latitude, coord.longitude]);
      const kmeansResult = kmeans(points, numClusters);
      return kmeansResult.clusters;
    case 'aco':
      const path = await findOptimalPathWithACO(coordinates);
      return segmentPathIntoClusters(path, numClusters);
    case 'hierarchical':
      return hierarchicalClusterAddresses(coordinates, numClusters);
    default:
      throw new Error('Unsupported clustering method');
  }
}

function optimizeRouteForCluster(clusterId, clusterAssignments, coordinates, orders, warehouseLocation) {
  // Create an array of orders with their coordinates and original indices
  const ordersWithCoords = coordinates.map((coord, index) => ({
    ...orders[index],
    latitude: coord.latitude,  // Storing latitude
    longitude: coord.longitude, // Storing longitude
    coord,
    originalIndex: index
  }));

  // Filter this array to only include orders in the current cluster
  const filteredOrders = ordersWithCoords.filter(order => clusterAssignments[order.originalIndex] === clusterId);

  // Sort the filtered orders by distance to the warehouse
  const sortedOrders = filteredOrders.sort((a, b) =>
    calculateDistance(warehouseLocation, a.coord) - calculateDistance(warehouseLocation, b.coord)
  );

  // Map the sorted orders to the required response structure including coordinates
  return sortedOrders.map(order => ({
    customerEmail: order.customerEmail,
    orderNumber: order.orderNumber,
    address: order.deliveryAddress,
    latitude: order.latitude,  // Include latitude in the response
    longitude: order.longitude // Include longitude in the response
  }));
}



function calculateDistance(point1, point2) {
  return Math.sqrt(Math.pow(point1.latitude - point2.latitude, 2) + Math.pow(point1.longitude - point2.longitude, 2));
}

// Alternative methods for route optimization below

// Hierarchical Clustering builds a tree of clusters that can be split or merged based on distance thresholds.
function hierarchicalClusterAddresses(coordinates, numClusters) {
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

async function findOptimalPathWithACO(coordinates) {
    try {
        // Dynamically import the ACO module
        //const ACO = await import('ant-colony-optimization');
        //const module = await import('ant-colony-optimization/src/ants.js');
        //const ACO = module.default;

        // Initialize the ACO algorithm with configuration
        const aco = new ACO({
            alpha: 1,  // influence of pheromone trails
            beta: 2,   // influence of heuristic value (visibility)
            rho: 0.5,  // pheromone evaporation rate
            q: 1       // pheromone deposit amount
        });

        // Create a graph from coordinates
        const graph = createGraphFromCoordinates(coordinates);
        aco.setGraph(graph);

        // Start the ACO algorithm with a specified number of ants and iterations
        aco.startAnts(100, 50);  // Example: start 100 ants for 50 iterations

        // Retrieve the best path after running the algorithm
        const result = await aco.getBestPath();
        return result.bestPath;  // Return the best path found by the ACO algorithm
    } catch (error) {
        console.error('Error loading or executing the ACO module:', error);
        throw error;  // Re-throw the error to handle it further up the call stack
    }
}

function segmentPathIntoClusters(path, numClusters) {
    const clusterSize = Math.ceil(path.length / numClusters);
    let clusterAssignments = new Array(path.length).fill(-1);
    
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