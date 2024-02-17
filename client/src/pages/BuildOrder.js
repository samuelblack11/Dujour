import React, { useState, useEffect, useContext} from 'react';
import axios from 'axios';
import './AllPages.css';
import { AuthContext } from '../App.js';

const BuildOrder = () => {
  const { user } = useContext(AuthContext);
  const [orderData, setOrderData] = useState({
    customerEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    creditCardNumber: '',
    creditCardExpiration: '',
    creditCardCVV: '',
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

  // Inside BuildOrder component
  useEffect(() => {
      console.log(user); // Debugging: Log the user object
      console.log(user.deliveryAddress);
    if (user.role !== 'admin') {
      setOrderData(currentOrderData => ({
        ...currentOrderData,
        deliveryAddress: user.deliveryAddress || '', // Autofill from user profile
      }));
    }
  }, [user]); // Depend on user to update the state when user info is available

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
  console.log("Removing item with id:", itemId);
  console.log("Current cart items:", cartItems);

  const updatedCartItems = cartItems.filter(item => {
    console.log(`Checking item with id ${item.id} against ${itemId}`);
    return item.id !== itemId;
  });
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
            id: itemToAdd.id
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
  //const nextOrderNumber = user.lastOrderNumber + 1;

  let nextOrderNumber;

  if (user.role === 'admin' && orderData.customerEmail) {
    // Admin is placing the order for another user
    try {
      // Query to get the specific user based on email
      const userResponse = await axios.get(`/api/users/email/${orderData.customerEmail}`);
      const userForOrder = userResponse.data;
      console.log("%%%")
      console.log(userForOrder)
      if (userForOrder) {
        nextOrderNumber = userForOrder.lastOrderNumber + 1;
      } else {
        // Default to 1 if no user is found
        nextOrderNumber = 1;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error or default to 1 if the user cannot be fetched
      nextOrderNumber = 1;
    }
  } else {
    // Non-admin user or admin not specifying a customer email
    nextOrderNumber = user.lastOrderNumber + 1;
  }


  let finalOrderData = { 
    ...orderData,
    orderNumber: nextOrderNumber,
    items: cartItems };
  if (user.role !== 'admin') {
    finalOrderData = {
      ...finalOrderData,
      customerEmail: user.email,
      deliveryAddress: user.deliveryAddress,
    };
  }
  //const order = {
  //  ...orderData,
  //  items: cartItems, // Assuming you want to submit items that are in the cart
  //};

  try {
    console.log("trying post...")
    console.log(user)
    console.log(user.email)
    console.log(finalOrderData)
    const orderResponse = await axios.post('/api/orders', finalOrderData);
    alert('Order submitted successfully!');

    // If the order submission is successful, increment the user's lastOrderNumber
    if (orderResponse.status === 200 || orderResponse.status === 201) {
      // Assuming the user's ID is stored in the context or derived from orderResponse
      const userEmail = user.email; // Make sure this is correctly sourced
      await axios.put(`/api/users/${userEmail}/incrementOrderNumber`);

      // Optionally, update the user context or local state to reflect the new lastOrderNumber
      // This step depends on how you manage user state in your application
    }

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

async function createNewOrderForUser(userName, orderData) {
  // Increment the user's lastOrderNumber atomically
  const user = await User.findOneAndUpdate(
    { userName },
    { $inc: { lastOrderNumber: 1 } },
    { new: true, upsert: true } // Upsert true to create the user if they don't exist
  );

  // Construct the uniqueOrderId
  const uniqueOrderId = `${userName}-${user.lastOrderNumber}`;

  // Create a new order with the uniqueOrderId
  const newOrder = new Order({
    ...orderData,
    userName,
    orderNumber: user.lastOrderNumber,
    uniqueOrderId
  });

  await newOrder.save();
  return newOrder;
}

return (
  <div className="build-order-container">
  <div className="left-sections"> {/* New wrapper for left sections */}
<div className="customer-info-section">
  <h3>Customer Information</h3>
  <table className="customer-info-table">
    <tbody>
       {user.role === 'admin' && (
      <tr>
        <td><label htmlFor="customerEmail">Customer Email:</label></td>
        <td><input type="email" name="customerEmail" id="customerEmail" value={orderData.customerEmail} onChange={handleChange} required /></td>
      </tr>
        )}
      <tr>
        <td><label htmlFor="deliveryAddress">Delivery Address:</label></td>
        <td><input type="text" name="deliveryAddress" id="deliveryAddress" value={orderData.deliveryAddress} onChange={handleChange} required /></td>
      </tr>
      <tr>
        <td><label htmlFor="deliveryDate">Delivery Date:</label></td>
        <td><input type="date" name="deliveryDate" id="deliveryDate" value={orderData.deliveryDate} onChange={handleChange} required /></td>
      </tr>
      <tr>
        <td><label htmlFor="creditCardNumber">Credit Card Number:</label></td>
        <td><input type="text" name="creditCardNumber" id="creditCardNumber" value={orderData.creditCardNumber} onChange={handleChange} required /></td>
    </tr>
    <tr>
        <td><label htmlFor="creditCardExpiration">Expiration Date:</label></td>
        <td><input type="text" name="creditCardExpiration" id="creditCardExpiration" value={orderData.creditCardExpiration} placeholder="MM/YY" onChange={handleChange} required /></td>
    </tr>
    <tr>
        <td><label htmlFor="creditCardCVV">Security Code (CVV):</label></td>
        <td><input type="text" name="creditCardCVV" id="creditCardCVV" value={orderData.creditCardCVV} onChange={handleChange} required /></td>
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
            <button onClick={() => handleAddToCart(item)} className="add-button">Add to Cart</button>
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
        <button className="add-button" onClick={() => toggleUpdateItem(index)}>{item.isUpdating ? "Confirm" : "Update"}</button>
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
          <button className="submit-btn" type="submit">Submit Order</button>
        </div>
        </form>
      </div>
    </div>
  </div>
);
};

export default BuildOrder;