import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

const RouteOptimization = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [numClusters, setNumClusters] = useState(2);
    const [optimizedRoutes, setOptimizedRoutes] = useState([]);
    const [routePlanExists, setRoutePlanExists] = useState(false);
    const [drivers, setDrivers] = useState([]); // Assuming you fetch this from somewhere
    const [routeDetails, setRouteDetails] = useState({ routes: [] });
    const [selectedDrivers, setSelectedDrivers] = useState({}); // {routeIndex: driverId}

    useEffect(() => {
        const fetchData = async () => {
            const exists = await checkForExistingRoutePlan(selectedDate);
            setRoutePlanExists(exists);

        if (!exists) {
            // No route plan exists, fetch orders for the selected date
            try {
                const { data } = await axios.get(`/api/orders?date=${selectedDate}`);
                setOrders(data); // Set orders for route optimization
                setSelectedOrders([]); // Reset any previously selected orders
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        } else {
            // A route plan exists, fetch route plan details
            try {
                const routePlanDetails = await axios.get(`/api/deliveryRoutes?date=${selectedDate}`);
                setRouteDetails(routePlanDetails.data); // Set route plan details for display
                setOrders([]); // Optionally clear orders as they are now part of the route plan
            } catch (error) {
                console.error("Error fetching route plan details:", error);
            }
        }
    };

    if (selectedDate) {
        fetchData();
    }
}, [selectedDate]);


const checkForExistingRoutePlan = async (selectedDate) => {
    try {
        const response = await axios.get(`/api/deliveryRoutes?date=${selectedDate}`);
        // Assuming response.data.exists is true if a route plan exists, false otherwise
        console.log(`Returned ${response} Routes`)
        console.log(routeDetails.routes)
        return response.data.exists;
    } catch (error) {
        console.error("Error checking for existing route plan:", error);
        return false; // Assume no plan exists if there's an error
    }
};


// Simplify form handlers by removing redundant code
const handleChange = (setter) => (e) => setter(e.target.value);

    // Submit handler simplified with async/await and direct mapping
const handleSubmit = async (e) => {
    e.preventDefault();

    // Use all orders displayed for the selected date
    try {
        const { data } = await axios.post('/api/optimize-deliveries', {
            orders, // Sending all fetched orders
            numClusters,
            warehouseLocation: "9464 Main St, FairFax, VA 22031"
        });
        console.log("???")
        console.log(data)
        // Assuming the backend processes this and returns optimized routes
        setOptimizedRoutes(data.optimizedRoutes || []);
    } catch (error) {
        console.error("Error optimizing routes:", error);
        setOptimizedRoutes([]);
    }
};

const flatRoutes = optimizedRoutes.flatMap((route, clusterIndex) =>
  route.map((stop, index) => ({
    stopNumber: index + 1,
    clusterId: clusterIndex + 1,
    address: stop.address, // Assuming each 'stop' object has an 'address' field
    customerEmail: stop.customerEmail, // Assuming each 'stop' object has a 'customerEmail' field
    orderNumber: stop.orderNumber, // Assuming each 'stop' object has an 'orderNumber' field
  }))
);



    const orderTableColumns = [
        { Header: 'Order Number', accessor: 'orderNumber' },
        { Header: 'Customer Email', accessor: 'customerEmail' },
        { Header: 'Delivery Address', accessor: 'deliveryAddress' },
        // Add more columns as needed
    ];

    // Only define columns once, if they do not change
    const routeTableColumns = [
        { Header: 'Cluster ID', accessor: 'clusterId' },
        { Header: 'Stop Number', accessor: 'stopNumber' },
        { Header: 'Address', accessor: 'address' },
    ];

    const handleSubmitRoutePlan = async () => {
        try {
            // Construct the payload according to your backend expectations
            const selectedDateTime = new Date(`${selectedDate}T06:00:00`);
            const estOffset = 5 * 60 * 60 * 1000; // UTC-5 for EST
            const estTime = new Date(selectedDateTime.getTime() - estOffset);
            const startTimeIso = estTime.toISOString();

            const routes = optimizedRoutes.map((route, index) => ({
                clusterId: index,
                stops: route.map((stop, stopIndex) => ({
                    stopNumber: stopIndex + 1,
                    address: stop.address,
                    // Include other necessary properties
                })),
                // Define startTime or other properties as needed
                startTime: startTimeIso
            }));

            await axios.post('/api/deliveryRoutes', { routes }); // Adjust the URL as necessary
            alert('Route plan submitted successfully.');
            // Optionally clear routes after submission
            // setOptimizedRoutes([]);
        } catch (error) {
            console.error('Error submitting route plan:', error);
            alert('Failed to submit route plan.');
        }
    };

    const handleClearRoutes = () => {
        setOptimizedRoutes([]); // Reset optimized routes
    };


// Driver assignment dropdown component
const DriverDropdown = ({ drivers, onDriverAssigned }) => (
    <select onChange={(e) => onDriverAssigned(e.target.value)}>
        <option value="">Select a driver</option>
        {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
        ))}
    </select>
);

const handleDriverSelection = (routeIndex, driverId) => {
    setSelectedDrivers({
        ...selectedDrivers,
        [routeIndex]: driverId,
    });
};

  // Render method
    return (
        <div className="route-optimization-container">
            <h2>Route Optimization</h2>
            <form className="form-section" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="dateSelect">Select Delivery Date:</label>
                    <input
                        type="date"
                        id="dateSelect"
                        value={selectedDate}
                        onChange={handleChange(setSelectedDate)}
                    />
                </div>
                {selectedDate && !routePlanExists && (
                    <>
                        <div className="form-group">
                            <label htmlFor="numClusters">Number of Clusters:</label>
                            <input
                                type="number"
                                id="numClusters"
                                value={numClusters}
                                onChange={handleChange(setNumClusters)}
                                min="1"
                            />
                        </div>
                        <button type="submit">Optimize Routes</button>
                    </>
                )}
            </form>
            {orders.length > 0 && !routePlanExists && (
                <GenericTable
                    data={orders}
                    columns={orderTableColumns}
                />
            )}
            {optimizedRoutes.length > 0 && (
                <>
                    <h2>Route Details</h2>
                    <GenericTable
                        data={flatRoutes}
                        columns={routeTableColumns}
                    />
                    <button onClick={handleSubmitRoutePlan}>Submit Route Plan</button>
                    <button onClick={handleClearRoutes}>Clear</button>
                </>
            )}
{routePlanExists && Array.isArray(routeDetails.routes) && routeDetails.routes.length > 0 && (
    <>
        <h2>Route Plan for {selectedDate}</h2>
        {routeDetails.routes.map((route, routeIndex) => (
            <div key={routeIndex}>
                <h3>Route {routeIndex + 1}</h3>
                {/* Driver dropdown for the entire route */}
                <DriverDropdown
                    drivers={drivers}
                    onDriverAssigned={(driverId) => handleDriverSelection(routeIndex, driverId)}
                />
 <table>
            <thead>
                <tr>
                    <th>Stop Number</th>
                    <th>Address</th>
                    <th>Customer Email</th>
                    <th>Order Number</th>
                </tr>
            </thead>
            <tbody>
                {route.stops.map((stop, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td> {/* Assuming stopNumber is the index + 1 */}
                        <td>{stop.address}</td>
                        <td>{stop.customerEmail}</td>
                        <td>{stop.orderNumber}</td>
                    </tr>
                ))}
            </tbody>
        </table>
            </div>
        ))}
    </>
)}

        </div>
    );
};



export default RouteOptimization;
