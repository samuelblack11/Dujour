import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UnfulfilledCargo.css';

const EditPopup = ({ cargo, onClose, onSave }) => {
  const [editData, setEditData] = useState({ ...cargo });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await axios.put(`/api/cargo/${editData._id}`, editData);
      onSave(); // This will close the popup and refresh the list
    } catch (error) {
      console.error('Error updating cargo:', error);
    }
  };
  return (
    <div className="popup">
      <div className="popup-inner">
        <label>Customer Name:</label>
        <input type="text" name="customerName" value={editData.customerName} onChange={handleChange} />

        <label>Customer Email:</label>
        <input type="email" name="customerEmail" value={editData.customerEmail} onChange={handleChange} />

        <label>Cargo Length:</label>
        <input type="number" name="cargoLength" value={editData.cargoLength} onChange={handleChange} />

        <label>Cargo Width:</label>
        <input type="number" name="cargoWidth" value={editData.cargoWidth} onChange={handleChange} />

        <label>Cargo Height:</label>
        <input type="number" name="cargoHeight" value={editData.cargoHeight} onChange={handleChange} />

        <label>Cargo Weight:</label>
        <input type="number" name="cargoWeight" value={editData.cargoWeight} onChange={handleChange} />

        <label>Cargo Category:</label>
        <input type="text" name="cargoCategory" value={editData.cargoCategory} onChange={handleChange} />

        <label>Cargo Hazardous:</label>
        <select name="cargoHazardous" value={editData.cargoHazardous} onChange={handleChange}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>

        <label>Cargo Value:</label>
        <input type="number" name="cargoValue" value={editData.cargoValue} onChange={handleChange} />

        <label>Pickup Address:</label>
        <input type="text" name="pickupAddress" value={editData.pickupAddress} onChange={handleChange} />

        <label>Delivery Address:</label>
        <input type="text" name="deliveryAddress" value={editData.deliveryAddress} onChange={handleChange} />

        <label>Delivery Date:</label>
        <input type="date" name="deliveryDate" value={editData.deliveryDate} onChange={handleChange} />

        <label>Delivery Status:</label>
        <input type="text" name="deliveryStatus" value={editData.deliveryStatus} onChange={handleChange} />

        <button className="popup-ok-btn" onClick={handleSaveClick}>OK</button>
        <button className="popup-cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const UnfulfilledCargo = () => {
  const [cargoList, setCargoList] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentEditCargo, setCurrentEditCargo] = useState(null);

  const handleEditClick = (cargo) => {
    setCurrentEditCargo(cargo);
    setShowEditPopup(true);
  };

  const handleSaveEdit = () =>  {
    setShowEditPopup(false);
    fetchCargo();
  };

  useEffect(() => {
    fetchCargo();
  }, []);

  const fetchCargo = async () => {
    try {
      const response = await axios.get('/api/cargo');
      setCargoList(response.data);
    } catch (error) {
      console.error('Error fetching cargo data', error);
    }
  };

  const deleteCargo = async (id) => {
    try {
      await axios.delete(`/api/cargo/${id}`);
      fetchCargo(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting cargo', error);
    }
  };

  return (
    <div>
      <h2>Unfulfilled Cargo</h2>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Email</th>
            <th>Cargo Length</th>
            <th>Cargo Width</th>
            <th>Cargo Height</th>
            <th>Cargo Value</th>
            <th>Cargo Category</th>
            <th>Cargo Hazardous</th>
            <th>Pickup Address</th>
            <th>Delivery Address</th>
            <th>Delivery Date</th>
            <th>Delivery Status</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {cargoList.map((cargo) => (
            <tr key={cargo._id}>
              <td>{cargo.customerName}</td>
              <td>{cargo.customerEmail}</td>
              <td>{cargo.cargoLength}</td>
              <td>{cargo.cargoWidth}</td>
              <td>{cargo.cargoHeight}</td>
              <td>{cargo.cargoValue}</td>
              <td>{cargo.cargoCategory}</td>
              <td>{cargo.cargoHazardous}</td>
              <td>{cargo.pickupAddress}</td>
              <td>{cargo.deliveryAddress}</td>
              <td>{cargo.deliveryDate}</td>
              <td>{cargo.deliveryStatus}</td>
              <td>
                <button onClick={() => handleEditClick(cargo)}>
                  Update
                </button>
              </td>
              <td>
                <button onClick={() => deleteCargo(cargo._id)}>
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showEditPopup && (
        <EditPopup
          cargo={currentEditCargo}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default UnfulfilledCargo;
