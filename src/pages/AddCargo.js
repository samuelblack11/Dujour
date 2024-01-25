import React, { useState } from 'react';
import axios from 'axios';
import './AddCargo.css';

const Popup = ({ message, onClose }) => (
  <div className="popup">
    <div className="popup-inner">
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);


const AddCargo = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    cargoLength: '',
    cargoWidth: '',
    cargoHeight: '',
    cargoWeight: '',
    cargoCategory: '',
    cargoHazardous: false,
    cargoValue: '',
    pickupAddress: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryStatus: 'pendingPickup'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');


  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue
    });

    // Reset validation error for this field
    setValidationErrors({
      ...validationErrors,
      [name]: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // New validation logic
    const newValidationErrors = {};

    // Email validation
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.customerEmail)) {
      newValidationErrors.customerEmail = true;
    }

    // Number validation for cargo dimensions and weight
    ['cargoLength', 'cargoWidth', 'cargoHeight', 'cargoWeight', 'cargoValue'].forEach(field => {
      if (isNaN(formData[field]) || formData[field] === '') {
        newValidationErrors[field] = true;
     }
    });

    // Check if there are any validation errors
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      return; // Stop submission if there are errors
   }

    try {
      const response = await axios.post('/api/cargo', formData);
      console.log(response.data);
      setPopupMessage('Cargo data saved successfully!');
      setShowPopup(true);
    } catch (error) {
      console.error('Error submitting form', error);
      setPopupMessage('Error saving data. Please try again.');
      setShowPopup(true);
    }
  };

  const handleCurrencyChange = (e) => {
  const { value } = e.target;
  const numericValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
  setFormData({
    ...formData,
    cargoValue: numericValue
  });
};

  return (
    <div className="add-cargo-container">
      <h2 className="add-cargo-header">Add Cargo</h2>
      <form id="addCargoForm" className="add-cargo-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name:</label>
          <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="customerEmail">Customer Email:</label>
          <input 
            type="email" 
            id="customerEmail" 
            name="customerEmail" 
            value={formData.customerEmail} 
            onChange={handleChange} 
            required 
            className={validationErrors.customerEmail ? 'error' : ''}/>        
          </div>

        <div className="form-group">
          <label htmlFor="cargoLength">Cargo Length (ft):</label>
          <input 
            type="number" 
            id="cargoLength" 
            name="cargoLength" 
            value={formData.cargoLength} 
            onChange={handleChange} 
            required 
            className={validationErrors.cargoLength ? 'error' : ''}/>
        </div>

        <div className="form-group">
          <label htmlFor="cargoWidth">Cargo Width (ft):</label>
          <input 
            type="number" 
            id="cargoWidth" 
            name="cargoWidth" 
            value={formData.cargoWidth} 
            onChange={handleChange} 
            required 
            className={validationErrors.cargoWidth ? 'error' : ''}/>
        </div>

        <div className="form-group">
          <label htmlFor="cargoHeight">Cargo Height (ft):</label>
          <input 
            type="number" 
            id="cargoHeight" 
            name="cargoHeight" 
            value={formData.cargoHeight} 
            onChange={handleChange} 
            required 
            className={validationErrors.cargoHeight ? 'error' : ''}/>
        </div>

        <div className="form-group">
          <label htmlFor="cargoWeight">Cargo Weight (lbs):</label>
          <input 
            type="number" 
            id="cargoWeight" 
            name="cargoWeight" 
            value={formData.cargoWeight} 
            onChange={handleChange} 
            required 
            className={validationErrors.cargoWeight ? 'error' : ''}/>
        </div>

        <div className="form-group">
          <label htmlFor="cargoCategory">Cargo Category:</label>
          <select id="cargoCategory" name="cargoCategory" value={formData.cargoCategory} onChange={handleChange}>
            <option value="option1"></option>
            <option value="Agricultural">Agricultural</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Construction">Construction Materials</option>
            <option value="CPG">Consumer Packaged Goods</option>
            <option value="Electronics">Electronics</option>
            <option value="Livestock">Livestock</option>
            <option value="Oil&Gas">Oil & Gas</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
            <option value="RefreigeratedGoods">Refreigerated Goods</option>
            <option value="Textiles&Apparel">Textiles & Apparel</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cargoHazardous">Cargo Hazardous Flag:</label>
          <select id="cargoHazardous" name="cargoHazardous" value={formData.cargoHazardous} onChange={handleChange}>
            <option value={false}>False</option>
            <option value={true}>True</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="cargoValue">Cargo Approximate Value:</label>
          <div className="currency-input-container">
            <span className="currency-symbol">$</span>
            <input 
             type="text" // Changed to text to handle custom formatting
             id="cargoValue" 
             name="cargoValue" 
             value={formData.cargoValue} 
             onChange={handleCurrencyChange}
             required 
             className={validationErrors.cargoValue ? 'error' : ''}
           />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="pickupAddress">Pickup Address:</label>
          <input type="text" id="pickupAddress" name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryAddress">Delivery Address:</label>
          <input type="text" id="deliveryAddress" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="deliveryDate">Deliver by Date:</label>
          <input type="date" id="deliveryDate" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
        </div>
        <div className="submitButton">
        <button type="submit">Submit</button>
        </div>
      </form>
      {showPopup && (
      <Popup
        message={popupMessage}
        onClose={() => {
          setShowPopup(false);
          if (popupMessage === 'Cargo data saved successfully!') {
            // Redirect to the homepage if the operation was successful
            window.location.href = '/';
          }
        }}
      />
    )}
    </div>
  );
};

export default AddCargo;
