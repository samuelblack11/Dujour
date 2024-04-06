import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

const RouteOptimization = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [numClusters, setNumClusters] = useState(2); // Starting point for cluster count

    // Fetch orders for the selected date
    useEffect(() => {
        if (selectedDate) {
            fetchOrdersForDate(selectedDate);
        }
    }, [selectedDate]);

    const fetchOrdersForDate = async (date) => {
        try {
            const response = await axios.get('/api/orders');
            const filteredOrders = response.data.filter(order =>
                new Date(order.deliveryDate).toLocaleDateString() === new Date(date).toLocaleDateString()
            );
            setOrders(filteredOrders);
            // Reset selections on date change
            setSelectedOrders([]);
        } catch (error) {
            console.error("Error fetching orders", error);
        }
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleNumClustersChange = (e) => {
        setNumClusters(e.target.value);
    };

    const handleOrderSelectionChange = (orderId) => {
        // Logic to mark an order as selected or not for optimization
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    const WAREHOUSE_LOCATION = "9464 Main St, FairFax, VA 22031"
    const [clusters, setClusters] = useState([]); // Add this state to store the clusters

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedOrderObjects = selectedOrders.map(orderId => orders.find(order => order._id === orderId));
        const deliveryAddresses = selectedOrderObjects.map(order => order.deliveryAddress);

        try {
            console.log("****");

            const response = await axios.post('/api/optimize-deliveries', {
                deliveryAddresses,
                numClusters,
                warehouseLocation: WAREHOUSE_LOCATION
            });

            console.log("Optimized Routes:", response.data);
            // Validate response format
            if (response.data.clusters && Array.isArray(response.data.clusters)) {
                setClusters(response.data.clusters);
            } else {
                console.error("Invalid or missing 'clusters' data in response");
                setClusters([]); // Reset or keep clusters empty to avoid errors
            }
        } catch (error) {
            console.error("Error optimizing routes", error);
            setClusters([]); // Ensure clusters is reset to avoid the error
        }
    };

    const ordersWithSelection = orders.map(order => ({
        ...order,
        isSelected: selectedOrders.includes(order._id)
    }));

    const orderTableColumns = [
    { Header: 'Order Number', accessor: 'orderNumber' },
    { Header: 'Customer Email', accessor: 'customerEmail' },
    { Header: 'Delivery Address', accessor: 'deliveryAddress' },
    {
        Header: 'Select',
        accessor: '_id',
        Cell: ({ row, handleOrderSelectionChange }) => (
            <input
                type="checkbox"
                checked={row.isSelected}
                onChange={() => handleOrderSelectionChange(row._id)}
            />
        )
    }
];

const getOrderTableColumns = (handleOrderSelectionChange) => [
    { Header: 'Order Number', accessor: 'orderNumber' },
    { Header: 'Customer Email', accessor: 'customerEmail' },
    { Header: 'Delivery Address', accessor: 'deliveryAddress' },
    {
        Header: 'Select',
        accessor: '_id',
        Cell: ({ row }) => (
            <input
                type="checkbox"
                checked={row.isSelected}
                onChange={() => handleOrderSelectionChange(row._id)}
            />
        )
    }
];


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
                    onChange={handleDateChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="numClusters">Number of Clusters:</label>
                <input
                    type="number"
                    id="numClusters"
                    value={numClusters}
                    onChange={handleNumClustersChange}
                    min="1"
                />
            </div>

            <button type="submit">Optimize Routes</button>
        </form>

        {orders.length > 0 && (
            <div>
                <h3>Select Orders for Route Optimization</h3>
                <GenericTable
                    data={ordersWithSelection}
                    columns={getOrderTableColumns(handleOrderSelectionChange)}
                    handleOrderSelectionChange={handleOrderSelectionChange}
                />
            </div>
        )}

        {/* Display Optimized Clusters and Their Routes */}
        {clusters.length > 0 && (
            <div>
                <h3>Optimized Route Clusters</h3>
                {clusters.map(cluster => (
                    <div key={cluster.clusterId}>
                        <h4>Cluster {cluster.clusterId}</h4>
                        <ul>
                            {cluster.addresses.map((address, index) => (
                                <li key={index}>{address}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        )}
    </div>
);

};

export default RouteOptimization;
