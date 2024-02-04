import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllPages.css';

const BuildOrder = () => {
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    items: [],
  });
  const [availableItems, setAvailableItems] = useState([]); // Items fetched from the server
  const [cartItems, setCartItems] = useState([]); // Items added to the cart
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setAvailableItems(response.data.map(item => ({
          ...item,
          quantity: 0,
          unitCost: item.unitCost || 0, // Assuming each item has a unitCost
        })));
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchAvailableItems();
  }, []);

  const handleChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (index, quantity) => {
      const newItems = [...availableItems];
      newItems[index] = { ...newItems[index], quantity: Number(quantity) };
      setAvailableItems(newItems);
      updateTotalCost(newItems);
};

const removeItemFromCart = (itemId) => {
  // Remove the item from the cart
  const updatedCartItems = cartItems.filter(item => item.id !== itemId);
  setCartItems(updatedCartItems);
};


const toggleUpdateItem = (index) => {
  const updatedCartItems = cartItems.map((item, idx) =>
    idx === index ? { ...item, isUpdating: !item.isUpdating } : item
  );
  setCartItems(updatedCartItems);
};

const handleItemQuantityChange = (index, newQuantity) => {
  const updatedCartItems = [...cartItems];
  updatedCartItems[index] = { ...updatedCartItems[index], quantity: Number(newQuantity) };
  setCartItems(updatedCartItems);
};

const handleAddToCart = (itemToAdd) => {
    // Check if the item already exists in the cart
    const existingItemIndex = cartItems.findIndex(item => item.itemName === itemToAdd.itemName);

    if (existingItemIndex >= 0) {
        // Item exists, update its quantity in the cart
        const updatedCartItems = [...cartItems];
        updatedCartItems[existingItemIndex] = {
            ...updatedCartItems[existingItemIndex],
            quantity: updatedCartItems[existingItemIndex].quantity + itemToAdd.quantity // Assuming you want to increase by 1, adjust accordingly
        };
        setCartItems(updatedCartItems);
    } else {
        // Item does not exist, add as new item in the cart
        const newItem = {
            ...itemToAdd,
            quantity: itemToAdd.quantity, // Assuming default quantity as 1, adjust if you're getting quantity from elsewhere
        };
        setCartItems([...cartItems, newItem]);
    }

        // Reset the quantity of the itemToAdd in availableItems
    const updatedAvailableItems = availableItems.map(item => {
        if (item.itemName === itemToAdd.itemName) {
            return { ...item, quantity: 0 }; // Reset quantity
        }
        return item;
    });
    setAvailableItems(updatedAvailableItems);


    // Update total cost after adding item to cart
    updateTotalCost();
};

// Adjust `updateTotalCost` to work directly with `cartItems` instead of `availableItems`
const updateTotalCost = () => {
    const total = cartItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    setTotalCost(total);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const order = {
    ...orderData,
    items: cartItems, // Assuming you want to submit items that are in the cart
  };

  try {
    const orderResponse = await axios.post('/api/orders', order);
    alert('Order submitted successfully!');

    // Assuming the order is submitted successfully, update the quantity available for each item
    cartItems.forEach(async (item) => {
      try {
        // You need to find the corresponding available item and calculate the new quantity
        const availableItem = availableItems.find(avItem => avItem.itemName === item.itemName);
        if (availableItem) {
          const newQuantityAvailable = availableItem.quantityAvailable - item.quantity;
          await axios.put(`/api/items/${availableItem._id}`, { quantityAvailable: newQuantityAvailable });
          // Assuming your server endpoint accepts the new quantityAvailable in this format
        }
      } catch (error) {
        console.error(`Error updating quantity for item ${item.itemName}`, error);
      }
    });

    // Reset the form and available items here
    setOrderData({
      customerName: '',
      customerEmail: '',
      deliveryAddress: '',
      deliveryDate: '',
      items: [],
    });
    setCartItems([]);
    setAvailableItems(availableItems.map(item => ({ ...item, quantity: 0 })));
  } catch (error) {
    console.error('Error submitting order', error);
    alert('Error submitting order. Please try again.');
  }
};


return (
  <div className="build-order-container">
      <div className="left-sections"> {/* New wrapper for left sections */}
<div className="order-info-section">
  <h3>Customer Information</h3>
  <table className="customer-info-table">
    <tbody>
      <tr>
        <td><label htmlFor="customerName">Customer Name:</label></td>
        <td><input type="text" name="customerName" id="customerName" value={orderData.customerName} onChange={handleChange} required /></td>
      </tr>
      <tr>
        <td><label htmlFor="customerEmail">Customer Email:</label></td>
        <td><input type="email" name="customerEmail" id="customerEmail" value={orderData.customerEmail} onChange={handleChange} required /></td>
      </tr>
      <tr>
        <td><label htmlFor="deliveryAddress">Delivery Address:</label></td>
        <td><input type="text" name="deliveryAddress" id="deliveryAddress" value={orderData.deliveryAddress} onChange={handleChange} required /></td>
      </tr>
      <tr>
        <td><label htmlFor="deliveryDate">Delivery Date:</label></td>
        <td><input type="date" name="deliveryDate" id="deliveryDate" value={orderData.deliveryDate} onChange={handleChange} required /></td>
      </tr>
    </tbody>
  </table>
</div>

  <div className="build-cart-section">
  <h3>Build Your Cart</h3>
  <table>
    <thead>
      <tr>
        <th>Item Name</th>
        <th>Unit Cost</th>
        <th>Quantity</th>
        <th>Line Item Cost</th>
        <th>Add to Cart</th>
      </tr>
    </thead>
    <tbody>
      {availableItems.map((item, index) => (
        <tr key={index}>
          <td>{item.itemName}</td>
          <td>${item.unitCost.toFixed(2)}</td>
          <td>
            <input
              className="input-quantity"
              type="number"
              min="0"
              value={item.quantity || ''}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
            />
          </td>
          <td>${(item.quantity * item.unitCost).toFixed(2)}</td>
          <td>
            <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div> {/* End of left-sections */}
  <div className="cart-summary">
  <h3>Cart Summary</h3>
    <table>
    <thead>
      <tr>
        <th>Item Name</th>
        <th>Quantity</th>
        <th>Unit Cost</th>
        <th>Line Item Cost</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
  {cartItems.map((item, index) => (
    <tr key={item.id}>
      <td>{item.itemName}</td>
      <td>
        {item.isUpdating ? (
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleItemQuantityChange(index, e.target.value)}
            autoFocus
          />
        ) : (
          item.quantity
        )}
      </td>
      <td>${item.unitCost.toFixed(2)}</td>
      <td>${(item.quantity * item.unitCost).toFixed(2)}</td>
      <td className="actions-cell">
        <button className="update-btn" onClick={() => toggleUpdateItem(index)}>{item.isUpdating ? "Confirm" : "Update"}</button>
        <button className="delete-btn" onClick={() => removeItemFromCart(item.id)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>

  </table>
  <p className="total-cost">Total Cost: ${cartItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0).toFixed(2)}</p>
      <div className="submitButton">
        <form onSubmit={handleSubmit}>
        <div className="submitButton">
          <button type="submit">Submit Order</button>
        </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default BuildOrder;