import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllPages.css';

const Popup = ({ message, onClose }) => (
  <div className="popup">
    <div className="popup-inner">
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const BuildOrder = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryDate: '',
    items: [], // Format: [{ itemName: 'Apples', quantity: 1 }]
    pickupAddress: '',
  });

  useEffect(() => {
  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setFormData({ ...formData, items: response.data });
    } catch (error) {
      console.error("Error fetching items:", error);
      // Handle error (e.g., set an error message state variable and display it)
    }
  };

  fetchItems();
}, []); // Empty dependency array means this effect runs once on mount


  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [availableItems, setAvailableItems] = useState([]); // Stores items fetched from the database

  const itemMenu = [
    { name: 'Apples', id: 'apples' },
    { name: 'Sweet Potatoes', id: 'sweetPotatoes' },
    { name: 'Strawberries', id: 'strawberries' }
  ];

  const pickupAddresses = [
    { name: 'Farm A', address: '123 Farm A Lane' },
    { name: 'Farm B', address: '456 Farm B Road' },
    { name: 'Farm C', address: '789 Farm C Blvd' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (e, itemName) => {
    const { value } = e.target;
    const newItems = [...formData.items];
    const itemIndex = newItems.findIndex(item => item.itemName === itemName);

    if (itemIndex > -1) {
      newItems[itemIndex].quantity = Number(value);
    } else {
      newItems.push({ itemName, quantity: Number(value) });
    }

    setFormData({
      ...formData,
      items: newItems.filter(item => item.quantity > 0)
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Construct the order object
  const order = {
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    deliveryAddress: formData.deliveryAddress,
    deliveryDate: formData.deliveryDate,
    items: formData.items // Ensure this includes item quantities and pickup addresses if needed
  };

  try {
    const response = await axios.post('/api/orders', order);
    console.log(response.data);
    setPopupMessage('Order submitted successfully!');
    setShowPopup(true);
  } catch (error) {
    console.error('Error submitting order', error);
    setPopupMessage('Error submitting order. Please try again.');
    setShowPopup(true);
  }
};


  return (
    <div className="build-order-container">
      <h2 className="build-order-header">Build Order</h2>
      <form id="buildOrderForm" className="build-order-form" onSubmit={handleSubmit}>
        {/* Generic Information Section */}
        <div className="generic-info-section">
          <h3>Customer Information</h3>
          <div className="form-group">
            <label htmlFor="customerName">Customer Name:</label>
            <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email:</label>
            <input type="email" id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address:</label>
            <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date:</label>
            <input type="date" id="deliveryDate" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
          </div>
        </div>
        <div className="build-cart-section">
        <h3>Build Your Cart</h3>
        {availableItems.map(item => (
        <div className="form-group" key={item.id}>
          <label htmlFor={item.name}>{item.name} Quantity:</label>
          <input type="number" id={item.name} name={item.name} min="0" onChange={(e) => handleItemChange(e, item.name, item.pickupAddress)} />
        </div>
        ))}
    </div>
        <div className="submitButton">
          <button type="submit">Submit Order</button>
        </div>
      </form>
      {showPopup && (
        <Popup
          message={popupMessage}
          onClose={() => {
            setShowPopup(false);
            if (popupMessage === 'Order submitted successfully!') {
              window.location.href = '/';
            }
          }}
        />
      )}
    </div>
  );
};

export default BuildOrder;
