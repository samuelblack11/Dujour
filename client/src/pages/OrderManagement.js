import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';
import './AllPages.css';
import { AuthContext } from '../App.js';

const OrderForm = ({ order, onSave, onClose, isEditable }) => {
  const initialState = order || {
    customerName: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    items: [{ itemName: '', quantity: '', pickupAddress: '' }],
  };

  const [orderData, setOrderData] = useState(initialState);

  const handleChange = (e, index) => {
    if (index !== undefined) {
      // Handle change for items array
      const updatedItems = orderData.items.map((item, i) => 
        i === index ? { ...item, [e.target.name]: e.target.value } : item
      );
      setOrderData({ ...orderData, items: updatedItems });
    } else {
      // Handle change for other fields
      setOrderData({ ...orderData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = order ? 'put' : 'post';
      const url = order ? `/api/orders/${order._id}` : '/api/orders';
      await axios[method](url, orderData);
      onSave(); // Close the popup and refresh the list
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const addItemField = () => {
    const newItem = { itemName: '', quantity: '', pickupAddress: '' };
    setOrderData({ ...orderData, items: [...orderData.items, newItem] });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Customer Email:</label>
        <input type="text" name="customerEmail" value={orderData.customerEmail} onChange={handleChange} readOnly={!isEditable} />
      </div>
      <div>
        <label>Order Status</label>
        <input type="text" name="status" value={orderData.status} onChange={handleChange} readOnly={!isEditable} />
      </div>
      <div>
      <div>
        <label>Total Cost:</label>
        <input type="number" name="totalCost" value={orderData.totalCost} onChange={handleChange} readOnly={!isEditable} />
      </div>
        <label>Delivery Address:</label>
        <input type="text" name="deliveryAddress" value={orderData.deliveryAddress} onChange={handleChange} readOnly={!isEditable} />
      </div>
      <div>
        <label>Delivery Date:</label>
        <input type="date" name="deliveryDate" value={orderData.deliveryDate} onChange={handleChange} readOnly={!isEditable} />
      </div>
      {orderData.items.map((item, index) => (
        <div key={index}>
          <label>Item Name:</label>
          <input type="text" name="itemName" value={item.itemName} onChange={(e) => handleChange(e, index)} readOnly={!isEditable} />
          <label>Quantity:</label>
          <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleChange(e, index)} readOnly={!isEditable} />
          <label>Pickup Address:</label>
          <input type="text" name="pickupAddress" value={item.pickupAddress} onChange={(e) => handleChange(e, index)} readOnly={!isEditable} />
        </div>
      ))}
      <button type="button" onClick={addItemField} className="add-button">Ok</button>
    </form>
  );
};

const OrderManagement = ({ mode }) => {
  const [orders, setOrders] = useState([]);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const { user } = useContext(AuthContext); // Get user info from context

  useEffect(() => {
    console.log("****")
    console.log("Current mode:", mode);
    if (mode === 'myOrders') {
      fetchMyOrders(); // Function to fetch only the current user's orders
    } else {
      fetchOrders(); // Fetch all orders
    }
  }, [mode]);

    const fetchMyOrders = async () => {
      try {
        console.log(user.email)
        console.log("-----")
        const allOrdersResponse = await axios.get('/api/orders');
        console.log(allOrdersResponse)
        const myOrders = allOrdersResponse.data.filter(order => order.customerEmail === user.email);
        console.log("+++++")
        console.log(myOrders)
        setOrders(myOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSaveOrder = async (orderData) => {
    const method = orderData._id ? 'put' : 'post';
    const url = orderData._id ? `/api/orders/${orderData._id}` : '/api/orders';

    try {
      await axios[method](url, orderData);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error);
    }
    setShowOrderPopup(false);
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`/api/orders/${id}`);
      fetchOrders(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
  // If no filter is set, return all orders
  if (!filterField || !filterValue) {
    return true;
  }
  
  // Assuming all values are strings; adjust if necessary
  const orderValue = String(order[filterField]).toLowerCase();
  return orderValue.includes(filterValue.toLowerCase());
});


  const columns = [
    { Header: 'Customer Email', accessor: 'customerEmail' },
    { Header: 'Order Status', accessor: 'status' },
    { Header: 'Order Cost', accessor: 'totalCost' },
    { Header: 'Delivery Address', accessor: 'deliveryAddress' },
    { Header: 'Delivery Date', accessor: 'deliveryDate' },
{
  Header: 'Actions',
  Cell: ({ row }) => {
    const isDraft = row.status === 'draft';
    return (
      <>
        <button onClick={() => {
          setCurrentOrder(row);
          setShowOrderPopup(true);
        }} className="edit-btn">{isDraft && mode === 'myOrders' ? 'View/Update' : 'View'}</button>
      {mode !== 'myOrders' && <button onClick={() => {
        console.log(row);
        console.log(row.original);
        deleteOrder(row._id); // Assuming row.original contains your order data
      }} className="delete-btn">Delete</button>}
      </>
    );
  }
}

  ];

  return (
    <div>
      <h3 class="page-header">Order Management</h3>
      <div>
      <select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
        <option value="">Select a field to filter by</option>
        <option value="customerName">Customer Name</option>
        <option value="status">Order Status</option>
        <option value="deliveryAddress">Delivery Address</option>
        <option value="deliveryDate">Delivery Date</option>
    </select>
  <input
    type="text"
    placeholder="Filter value"
    value={filterValue}
    onChange={(e) => setFilterValue(e.target.value)}
  />
</div>
      <GenericTable data={filteredOrders} columns={columns} />
      {showOrderPopup && (
        <GenericPopup show={showOrderPopup} onClose={() => setShowOrderPopup(false)}>
          <OrderForm order={currentOrder} onSave={handleSaveOrder} onClose={() => setShowOrderPopup(false)} />
        </GenericPopup>
      )}
    </div>
  );
};

export default OrderManagement;