import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';
import './UnfulfilledCargo.css';

const EditPopup = ({ cargo, onClose, onSave }) => {
  const [editData, setEditData] = useState({ ...cargo });
  const [cargoCategories, setCargoCategories] = useState([]);

  // Fetch Cargo Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/cargoCategories');
        setCargoCategories(response.data);
      } catch (error) {
        console.error("Error fetching cargo categories", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("EditPopup receiving cargo:", cargo);
    setEditData({ ...cargo });
  }, [cargo]);

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

const formFieldsConfig = [
  { label: 'Customer Name', name: 'customerName', type: 'text' },
  { label: 'Customer Email', name: 'customerEmail', type: 'email' },
  { label: 'Cargo Length', name: 'cargoLength', type: 'number' },
  { label: 'Cargo Width', name: 'cargoWidth', type: 'number' },
  { label: 'Cargo Height', name: 'cargoHeight', type: 'number' },
  { label: 'Cargo Weight', name: 'cargoWeight', type: 'number' },
    {
      label: 'Cargo Category',
      name: 'cargoCategory',
      type: 'select',
      options: cargoCategories.map(category => ({ value: category.key, label: category.value }))
    },
    {
    label: 'Cargo Hazardous',
    name: 'cargoHazardous',
    type: 'select',
    options: [
      { value: 'false', label: 'False' },
      { value: 'true', label: 'True' }
    ]
  },
  { label: 'Cargo Value', name: 'cargoValue', type: 'number' },
  { label: 'Pickup Address', name: 'pickupAddress', type: 'text' },
  { label: 'Delivery Address', name: 'deliveryAddress', type: 'text' },
  { label: 'Delivery Date', name: 'deliveryDate', type: 'date' },
  { label: 'Delivery Status', name: 'deliveryStatus', type: 'text' },
];

  return (
    <>
      {formFieldsConfig.map((field) => (
        <div key={field.name}>
          <label>{field.label}:</label>
          {field.type === 'select' ? (
            <select name={field.name} value={editData[field.name] || ''} onChange={handleChange}>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input type={field.type} name={field.name} value={editData[field.name] || ''} onChange={handleChange} />
          )}
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>OK</button>
    </>
  );
};

const UnfulfilledCargo = () => {
  const [cargoList, setCargoList] = useState([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [currentEditCargo, setCurrentEditCargo] = useState(null);

  const handleEditClick = (cargo) => {
    console.log("Selected cargo for edit:", cargo);
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

  const columns = [
  { Header: 'Customer Name', accessor: 'customerName' },
  { Header: 'Email', accessor: 'customerEmail' },
  { Header: 'Cargo Length', accessor: 'cargoLength' },
  { Header: 'Cargo Width', accessor: 'cargoWidth' },
  { Header: 'Cargo Height', accessor: 'cargoHeight' },
  { Header: 'Cargo Value', accessor: 'cargoValue' },
  { Header: 'Cargo Weight', accessor: 'cargoWeight' },
  { Header: 'Cargo Category', accessor: 'cargoCategory' },
  { Header: 'Cargo Hazardous', accessor: 'cargoHazardous' },
  { Header: 'Pickup Address', accessor: 'pickupAddress' },
  { Header: 'Delivery Address', accessor: 'deliveryAddress' },
  { Header: 'Delivery Date', accessor: 'deliveryDate' },
  { Header: 'Delivery Status', accessor: 'deliveryStatus' },
  {
    Header: 'Update',
    accessor: 'update',
    Cell: ({ row }) => {
      console.log("Complete Row:", row);
      return (
        <button onClick={() => {
          console.log("Row data in table:", row); // Debug log
          handleEditClick(row);
        }}>
          Update
        </button>
      );
    }
  },
  {
    Header: 'Delete',
    accessor: 'delete',
    Cell: ({ row }) => (
      <button onClick={() => deleteCargo(row._id)}>
        🗑️
      </button>
    )
  }
];

console.log("Cargo List:", cargoList);
  return (
    <div>
      <h2>Unfulfilled Cargo</h2>
      <GenericTable 
      data={cargoList}
      columns={columns} 
      handleEditClick={handleEditClick} 
      deleteCargo={deleteCargo}
      />
      {showEditPopup && (
        <GenericPopup show={showEditPopup} onClose={() => setShowEditPopup(false)}>
          <EditPopup
            cargo={currentEditCargo}
            onSave={handleSaveEdit}
          />
        </GenericPopup>
      )}
    </div>
  );
};

export default UnfulfilledCargo;
