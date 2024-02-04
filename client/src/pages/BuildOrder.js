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

  const handleItemChange = (index, value) => {
    let newItems = [...availableItems];
    newItems[index].quantity = Number(value);
    setAvailableItems(newItems);

    // Update total cost
    updateTotalCost(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
  const newItems = [...availableItems];
  newItems[index] = { ...newItems[index], quantity: Number(quantity) };
  setAvailableItems(newItems);
};

const handleAddToCart = (itemToAdd) => {
  if (!itemToAdd.quantity || itemToAdd.quantity === 0) {
    alert("Please enter a quantity before adding to cart.");
    return;
  }

  const existingItemIndex = cartItems.findIndex(cartItem => cartItem.itemName === itemToAdd.itemName);
  if (existingItemIndex > -1) {
    // Update quantity if item exists in cart
    const newCartItems = [...cartItems];
    newCartItems[existingItemIndex].quantity += itemToAdd.quantity;
    setCartItems(newCartItems);
  } else {
    // Add new item to cart
    setCartItems([...cartItems, itemToAdd]);
  }

  // Mark the item as disabled in availableItems
  const newAvailableItems = availableItems.map(item => 
    item.itemName === itemToAdd.itemName ? { ...item, disabled: true, quantity: 0 } : item
  );
  setAvailableItems(newAvailableItems);
};



  const updateTotalCost = (items) => {
    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    setTotalCost(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const order = {
      ...orderData,
      items: availableItems.filter(item => item.quantity > 0),
    };

    try {
      await axios.post('/api/orders', order);
      alert('Order submitted successfully!');
      // Redirect or clear form here as needed
    } catch (error) {
      console.error('Error submitting order', error);
      alert('Error submitting order. Please try again.');
    }
  };

return (
  <div className="build-order-container">
      <div className="left-sections"> {/* New wrapper for left sections */}
    <div className="order-info-section">
      <h2>Customer Information</h2>
      <div>
        <label>Customer Name:</label>
        <input type="text" name="customerName" value={orderData.customerName} onChange={handleChange} required />
      </div>
      <div>
        <label>Customer Email:</label>
        <input type="email" name="customerEmail" value={orderData.customerEmail} onChange={handleChange} required />
      </div>
      <div>
        <label>Delivery Address:</label>
        <input type="text" name="deliveryAddress" value={orderData.deliveryAddress} onChange={handleChange} required />
      </div>
      <div>
        <label>Delivery Date:</label>
        <input type="date" name="deliveryDate" value={orderData.deliveryDate} onChange={handleChange} required />
      </div>
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
              type="number"
              min="0"
              value={item.quantity || ''}
              onChange={(e) => handleQuantityChange(index, e.target.value)}
              disabled={item.disabled} // Disable input if item is marked as disabled
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
      </tr>
    </thead>
    <tbody>
      {cartItems.map((item, index) => (
        <tr key={index}>
          <td>{item.itemName}</td>
          <td>{item.quantity}</td>
          <td>${item.unitCost.toFixed(2)}</td>
          <td>${(item.quantity * item.unitCost).toFixed(2)}</td>
        </tr>
      ))}
    </tbody>
  </table>
  <p className="total-cost">Total Cost: ${cartItems.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0).toFixed(2)}</p>
      <div className="submitButton">
        <button type="submit">Submit Order</button>
      </div>
    </div>
  </div>
);
};

export default BuildOrder;