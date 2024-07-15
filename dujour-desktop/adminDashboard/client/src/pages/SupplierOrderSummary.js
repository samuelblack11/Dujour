import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import './AllPages.css';
import { GenericTable } from './ReusableReactComponents';

const getSaturdays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let thisSaturday = new Date(today);
    let nextSaturday = new Date(today);

    thisSaturday.setDate(today.getDate() + (6 - dayOfWeek));  // Always the nearest Saturday
    nextSaturday.setDate(today.getDate() + (13 - dayOfWeek)); // The Saturday after the nearest

    return {
        thisSaturday: thisSaturday.toISOString().split('T')[0],
        nextSaturday: nextSaturday.toISOString().split('T')[0]
    };
};


const SupplierWeeklyOrderSummary = () => {
    const { user } = useContext(AuthContext);
    const [ordersSummaryThisSaturday, setOrdersSummaryThisSaturday] = useState([]);
    const [ordersSummaryNextSaturday, setOrdersSummaryNextSaturday] = useState([]);
    const [farmId, setFarmId] = useState(null);
    const { thisSaturday, nextSaturday } = getSaturdays();

    const columns = [
    { Header: 'Item Name', accessor: 'itemName' },
    { Header: 'Total Ordered', accessor: 'totalOrdered' },
     ...(user.role === 'admin' ? [{ Header: 'Farm Name', accessor: 'farmName' }] : [])
];

const fetchFarmIdByName = async (farmName) => {
    try {
        const response = await axios.get(`/api/farms/byname/${encodeURIComponent(farmName)}`);
        return response.data._id;  // Assuming the farm object has an _id field
    } catch (error) {
        console.error('Error fetching farm by name:', error);
        return null;  // Handle null case in your logic
    }
};


     useEffect(() => {
        if (user.name && user.role != 'admin') {
            fetchFarmIdByName(user.name).then(setFarmId);
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const allOrdersResponse = await axios.get('/api/orders');
                if (user.role === 'admin') {
                    // Process orders for all farms for admin users
                    processOrders(allOrdersResponse.data, thisSaturday, setOrdersSummaryThisSaturday);
                    if (new Date().getDay() === 5 || new Date().getDay() === 6) { // If today is Friday or Saturday
                        processOrders(allOrdersResponse.data, nextSaturday, setOrdersSummaryNextSaturday);
                    }
                } else if (farmId) {
                    // Process orders only for a specific farm for non-admin users
                    processOrders(allOrdersResponse.data, thisSaturday, setOrdersSummaryThisSaturday, farmId);
                    if (new Date().getDay() === 5 || new Date().getDay() === 6) {
                        processOrders(allOrdersResponse.data, nextSaturday, setOrdersSummaryNextSaturday, farmId);
                    }
                }
            } catch (error) {
                console.error('Error fetching order summary:', error);
            }
        };

        fetchOrders();
    }, [user, farmId, thisSaturday, nextSaturday]);

const processOrders = async (orders, saturday, setOrdersSummary, farmId = null) => {
    // Check if there are any orders to process
    if (!orders.length) {
        console.log("No orders available.");
        setOrdersSummary([]);
        return;
    }

    // Fetch all farms and create a map of farm ID to farm name
    console.log("Fetching farm data...");
    const farmsResponse = await axios.get('/api/farms');
    if (!farmsResponse.data.length) {
        console.log("No farm data available.");
        setOrdersSummary([]);
        return;
    }
    const farmMap = new Map(farmsResponse.data.map(farm => [farm._id, farm.name]));

    // Filter orders that match the specific farm ID and date criteria
    const filteredOrders = orders.filter(order =>
        order.items.some(item =>
            item && item.item && // Check that item and item.item are not null
            item.item.farm && // Ensure farm ID is not null
            (!farmId || item.item.farm === farmId) && 
            order.deliveryDate.split('T')[0] === saturday
        )
    );

    // Check if any items match the filtering criteria after processing
    if (!filteredOrders.length) {
        console.log("No matching items for the specified farm and/or date.");
        setOrdersSummary([]);
        return;
    }

    // Aggregate and process the filtered orders
    const itemsSummary = filteredOrders.reduce((acc, order) => {
        order.items.forEach(item => {
            if (item && item.item && item.item.farm && (!farmId || item.item.farm === farmId)) {
                const itemName = item.item.itemName;
                const itemFarmName = farmMap.get(item.item.farm); // Fetching farm name from the map
                if (acc[itemName]) {
                    acc[itemName].totalOrdered += item.quantity;
                } else {
                    acc[itemName] = {
                        itemName,
                        totalOrdered: item.quantity,
                        farmName: itemFarmName || "Unknown Farm", // Default to "Unknown Farm" if not found
                        deliveryDate: saturday
                    };
                }
            }
        });
        return acc;
    }, {});

    setOrdersSummary(Object.values(itemsSummary));
};




    return (
        <div className="order-summary-container">
            <h2>Weekly Item Totals</h2>
            <h3>for {user.name}</h3>
            <h3>on {thisSaturday}</h3>
            <GenericTable data={ordersSummaryThisSaturday} columns={columns} />
            {new Date().getDay() === 5 || new Date().getDay() === 6 && (
                <>
                    <h3>on {nextSaturday}</h3>
                    <GenericTable data={ordersSummaryNextSaturday} columns={columns} />
                </>
            )}
        </div>
    );
};

export default SupplierWeeklyOrderSummary;
