import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';
import './AllPages.css';

// AddDriverPopup Component
const AddDriverPopup = ({ onSave, onClose }) => {
  const [newDriverData, setNewDriverData] = useState({
    Name: '',
    Address: '',
    LicenseNumber: '',
    LicenseExpiration: '',
    PhoneNumber: '',
    Email: '',
    EmergencyContact: '',
    DateOfHiring: '',
    Position: '',
    Department: '',
    DrivingRecord: '',
    TrainingRecords: '',
    StandardVehicleAssignment: '',
    PerformanceReviews: ''
  });

  const handleChange = (e) => {
    setNewDriverData({ ...newDriverData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await onSave(newDriverData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const driverFieldsConfig = [
  { label: 'Name', name: 'Name', type: 'text' },
  { label: 'Address', name: 'Address', type: 'text' },
  { label: 'License Number', name: 'LicenseNumber', type: 'text' },
  { label: 'License Expiration', name: 'LicenseExpiration', type: 'date' },
  { label: 'Phone Number', name: 'PhoneNumber', type: 'text' },
  { label: 'Email', name: 'Email', type: 'email' },
  { label: 'Emergency Contact', name: 'EmergencyContact', type: 'text' },
  { label: 'Date Of Hiring', name: 'DateOfHiring', type: 'date' },
  { label: 'Position', name: 'Position', type: 'text' },
  { label: 'Department', name: 'Department', type: 'text' },
  { label: 'Driving Record', name: 'DrivingRecord', type: 'text' },
  { label: 'Training Records', name: 'TrainingRecords', type: 'text' },
  { label: 'Standard Vehicle Assignment', name: 'StandardVehicleAssignment', type: 'text' },
  { label: 'Performance Reviews', name: 'PerformanceReviews', type: 'text' }
  ];

  return (
    <>
      {driverFieldsConfig.map((field) => (
        <div key={field.name}>
          <label>{field.label}:</label>
          <input 
            type={field.type} 
            name={field.name} 
            value={newDriverData[field.name]} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>Add Driver</button>
    </>
  );
};

// Similar structure to AddDriverPopup, but with pre-filled data for editing
const EditDriverPopup = ({ driver, onSave, onClose }) => {
  const [editData, setEditData] = useState({ ...driver });

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await onSave(editData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const driverFieldsConfig = [
  { label: 'Name', name: 'Name', type: 'text' },
  { label: 'Address', name: 'Address', type: 'text' },
  { label: 'License Number', name: 'LicenseNumber', type: 'text' },
  { label: 'License Expiration', name: 'LicenseExpiration', type: 'date' },
  { label: 'Phone Number', name: 'PhoneNumber', type: 'text' },
  { label: 'Email', name: 'Email', type: 'email' },
  { label: 'Emergency Contact', name: 'EmergencyContact', type: 'text' },
  { label: 'Date Of Hiring', name: 'DateOfHiring', type: 'date' },
  { label: 'Position', name: 'Position', type: 'text' },
  { label: 'Department', name: 'Department', type: 'text' },
  { label: 'Driving Record', name: 'DrivingRecord', type: 'text' },
  { label: 'Training Records', name: 'TrainingRecords', type: 'text' },
  { label: 'Standard Vehicle Assignment', name: 'StandardVehicleAssignment', type: 'text' },
  { label: 'Performance Reviews', name: 'PerformanceReviews', type: 'text' }
  ];

  return (
    <>
      {driverFieldsConfig.map((field) => (
        <div key={field.name}>
          <label>{field.label}:</label>
          <input 
            type={field.type} 
            name={field.name} 
            value={editData[field.name] || ''} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>Update Driver</button>
    </>
  );
};

// Main component
const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [showAddDriverPopup, setShowAddDriverPopup] = useState(false);
  const [currentEditDriver, setCurrentEditDriver] = useState(null);
  const [showEditDriverPopup, setShowEditDriverPopup] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('/api/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching driver data', error);
    }
  };

  const handleAddDriver = () => {
    setCurrentEditDriver(null);
    setShowAddDriverPopup(true);
  };

    const handleSaveDriver = async (driverData) => {
    if (driverData._id) {
      await handleUpdateDriver(driverData);
    } else {
      await addDriver(driverData);
    }
  };

  const addDriver = async (newDriver) => {
    try {
      await axios.post('/api/drivers', newDriver);
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

const handleUpdateDriver = async (updatedDriver) => {
  try {
    await axios.put(`/api/drivers/${updatedDriver._id}`, updatedDriver);
    fetchDrivers();
  } catch (error) {
    console.error('Error updating driver:', error);
  }
};

  // Delete functions for drivers
  const deleteDriver = async (id) => {
    try {
      await axios.delete(`/api/drivers/${id}`);
      fetchDrivers(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting driver', error);
    }
  };

  const driverColumns = [
  { Header: 'Name', accessor: 'Name' },
  { Header: 'Address', accessor: 'Address' },
  { Header: 'License Number', accessor: 'LicenseNumber' },
  { Header: 'License Expiration', accessor: 'LicenseExpiration' },
  { Header: 'Phone Number', accessor: 'PhoneNumber' },
  { Header: 'Email', accessor: 'Email' },
  { Header: 'Emergency Contact', accessor: 'EmergencyContact' },
  { Header: 'Date of Hiring', accessor: 'DateOfHiring' },
  { Header: 'Position', accessor: 'Position' },
  { Header: 'Department', accessor: 'Department' },
  { Header: 'Driving Record', accessor: 'DrivingRecord' },
  { Header: 'Training Records', accessor: 'TrainingRecords' },
  { Header: 'Standard Vehicle Assignment', accessor: 'StandardVehicleAssignment' },
  { Header: 'Performance Reviews', accessor: 'PerformanceReviews' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <>
          <button onClick={() => {
            setCurrentEditDriver(row);
            setShowEditDriverPopup(true);
          }}>Edit</button>
          <button onClick={() => deleteDriver(row._id)}>Delete</button>
        </>
      )
    }
  ];

return (
  <div className="driver-vehicle-management-container">
    <div className="driver-table">
      <h2>Drivers</h2>
      <button onClick={handleAddDriver}>+</button>
      <GenericTable data={drivers} columns={driverColumns} />
    </div>
    {showAddDriverPopup && (
      <GenericPopup show={showAddDriverPopup} onClose={() => setShowAddDriverPopup(false)}>
        <AddDriverPopup onSave={handleSaveDriver} onClose={() => setShowAddDriverPopup(false)} />
      </GenericPopup>
    )}
    {showEditDriverPopup && (
      <GenericPopup show={showEditDriverPopup} onClose={() => setShowEditDriverPopup(false)}>
        <EditDriverPopup driver={currentEditDriver || {}} onSave={handleSaveDriver} onClose={() => setShowEditDriverPopup(false)} />
      </GenericPopup>
    )}
    </div>
  );
};

export default DriverManagement;