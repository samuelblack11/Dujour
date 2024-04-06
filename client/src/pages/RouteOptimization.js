import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

const RouteOptimization = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [numClusters, setNumClusters] = useState(2);
    const [optimizedRoutes, setOptimizedRoutes] = useState([]);

    // Combine fetching orders and updating selected objects into a single useEffect
    useEffect(() => {
        const fetchOrdersForDate = async () => {
            if (!selectedDate) return;
            try {
                const { data } = await axios.get(`/api/orders?date=${selectedDate}`);
                setOrders(data);
                setSelectedOrders([]);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        fetchOrdersForDate();
    }, [selectedDate]);

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


        // Assuming the backend processes this and returns optimized routes
        setOptimizedRoutes(data.optimizedRoutes || []);
    } catch (error) {
        console.error("Error optimizing routes:", error);
        setOptimizedRoutes([]);
    }
};

// Assuming the backend sends an array of arrays of orders as optimized routes
const flatRoutes = optimizedRoutes.flatMap((route, clusterIndex) =>
  route.map((order, index) => ({
    stopNumber: index + 1,
    clusterId: clusterIndex + 1,
    address: order.deliveryAddress, // Directly using the order object
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


return (
    <div className="route-optimization-container">
        <h2>Route Optimization</h2>
        <form onSubmit={handleSubmit} className="form-section">
            <div className="form-group">
                <label htmlFor="dateSelect">Select Delivery Date:</label>
                <input
                    type="date"
                    id="dateSelect"
                    value={selectedDate}
                    onChange={handleChange(setSelectedDate)}
                />
            </div>
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
        </form>

        {orders.length > 0 && (
            <GenericTable
                data={orders} // Display all orders without selection checkboxes
                columns={orderTableColumns} // Define columns as needed, excluding selection logic
            />
        )}
        <h2>Route Details</h2>

            {optimizedRoutes.length > 0 && (
                <>
                    <GenericTable
                        data={flatRoutes}
                        columns={routeTableColumns}
                    />
                    <button type="submit-btn" onClick={handleSubmitRoutePlan}>Submit Route Plan</button>
                    <button type="submit-btn" onClick={handleClearRoutes}>Clear</button>
                </>
            )}
        </div>
    );
};

export default RouteOptimization;
