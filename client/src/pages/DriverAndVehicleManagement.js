import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

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

// AddVehiclePopup Component
const AddVehiclePopup = ({ onSave, onClose }) => {
  const [newVehicleData, setNewVehicleData] = useState({
    Year: '',
    Make: '',
    Model: '',
    VehicleType: '',
    Mileage: '',
    VehicleStatus: '',
    LicensePlateNumber: '',
    VIN: '',
    OwnerOrCompanyName: '',
    ServiceHistory: '',
    InsuranceDetails: '',
    RegistrationPolicy: '',
    RegistrationExpiration: '',
    GPSDeviceID: '',
    PurchaseDate: '',
    PurchasePrice: '',
    AssignedDriver: ''
  });

  const handleChange = (e) => {
    setNewVehicleData({ ...newVehicleData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await onSave(newVehicleData);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

const vehicleFieldsConfig = [
  { label: 'Year', name: 'Year', type: 'number' },
  { label: 'Make', name: 'Make', type: 'text' },
  { label: 'Model', name: 'Model', type: 'text' },
  { label: 'Vehicle Type', name: 'VehicleType', type: 'text' },
  { label: 'Mileage', name: 'Mileage', type: 'number' },
  { label: 'Vehicle Status', name: 'VehicleStatus', type: 'text' },
  { label: 'License Plate Number', name: 'LicensePlateNumber', type: 'text' },
  { label: 'VIN', name: 'VIN', type: 'text' },
  { label: 'Owner Or Company Name', name: 'OwnerOrCompanyName', type: 'text' },
  { label: 'Service History', name: 'ServiceHistory', type: 'text' },
  { label: 'Insurance Details', name: 'InsuranceDetails', type: 'text' },
  { label: 'Registration Policy', name: 'RegistrationPolicy', type: 'text' },
  { label: 'Registration Expiration', name: 'RegistrationExpiration', type: 'date' },
  { label: 'GPS Device ID', name: 'GPSDeviceID', type: 'text' },
  { label: 'Purchase Date', name: 'PurchaseDate', type: 'date' },
  { label: 'Purchase Price', name: 'PurchasePrice', type: 'number' },
  { label: 'Assigned Driver', name: 'AssignedDriver', type: 'text' }
  ];

  return (
    <>
      {vehicleFieldsConfig.map((field) => (
        <div key={field.name}>
          <label>{field.label}:</label>
          <input 
            type={field.type} 
            name={field.name} 
            value={newVehicleData[field.name]} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>Add Vehicle</button>
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

// Similar structure to AddVehiclePopup, but with pre-filled data for editing
const EditVehiclePopup = ({ vehicle, onSave, onClose }) => {
  const [editData, setEditData] = useState({ ...vehicle });

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

const vehicleFieldsConfig = [
  { label: 'Year', name: 'Year', type: 'number' },
  { label: 'Make', name: 'Make', type: 'text' },
  { label: 'Model', name: 'Model', type: 'text' },
  { label: 'Vehicle Type', name: 'VehicleType', type: 'text' },
  { label: 'Mileage', name: 'Mileage', type: 'number' },
  { label: 'Vehicle Status', name: 'VehicleStatus', type: 'text' },
  { label: 'License Plate Number', name: 'LicensePlateNumber', type: 'text' },
  { label: 'VIN', name: 'VIN', type: 'text' },
  { label: 'Owner Or Company Name', name: 'OwnerOrCompanyName', type: 'text' },
  { label: 'Service History', name: 'ServiceHistory', type: 'text' },
  { label: 'Insurance Details', name: 'InsuranceDetails', type: 'text' },
  { label: 'Registration Policy', name: 'RegistrationPolicy', type: 'text' },
  { label: 'Registration Expiration', name: 'RegistrationExpiration', type: 'date' },
  { label: 'GPS Device ID', name: 'GPSDeviceID', type: 'text' },
  { label: 'Purchase Date', name: 'PurchaseDate', type: 'date' },
  { label: 'Purchase Price', name: 'PurchasePrice', type: 'number' },
  { label: 'Assigned Driver', name: 'AssignedDriver', type: 'text' }
  ];

  return (
    <>
      {vehicleFieldsConfig.map((field) => (
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
      <button className="popup-ok-btn" onClick={handleSaveClick}>Update Vehicle</button>
    </>
  );
};

// Main component
const DriverAndVehicleManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddDriverPopup, setShowAddDriverPopup] = useState(false);
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState(false);
  const [currentEditDriver, setCurrentEditDriver] = useState(null);
  const [showEditDriverPopup, setShowEditDriverPopup] = useState(false);
  const [currentEditVehicle, setCurrentEditVehicle] = useState(null);
  const [showEditVehiclePopup, setShowEditVehiclePopup] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('/api/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching driver data', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicle data', error);
    }
  };

    const handleAddDriver = () => {
    setCurrentEditDriver(null);
    setShowAddDriverPopup(true);
  };

  const handleAddVehicle = () => {
    setCurrentEditVehicle(null);
    setShowAddVehiclePopup(true);
  };

    const handleSaveDriver = async (driverData) => {
    if (driverData._id) {
      await handleUpdateDriver(driverData);
    } else {
      await addDriver(driverData);
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    if (vehicleData._id) {
      await handleUpdateVehicle(vehicleData);
    } else {
      await addVehicle(vehicleData);
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

  const addVehicle = async (newVehicle) => {
    try {
      await axios.post('/api/vehicles', newVehicle);
      fetchVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
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

const handleUpdateVehicle = async (updatedVehicle) => {
  try {
    await axios.put(`/api/vehicles/${updatedVehicle._id}`, updatedVehicle);
    fetchVehicles();
  } catch (error) {
    console.error('Error updating vehicle:', error);
  }
};

  // Delete functions for drivers and vehicles
  const deleteDriver = async (id) => {
    try {
      await axios.delete(`/api/drivers/${id}`);
      fetchDrivers(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting driver', error);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await axios.delete(`/api/vehicles/${id}`);
      fetchVehicles(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting vehicle', error);
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

  const vehicleColumns = [
  { Header: 'Year', accessor: 'Year' },
  { Header: 'Make', accessor: 'Make' },
  { Header: 'Model', accessor: 'Model' },
  { Header: 'Vehicle Type', accessor: 'VehicleType' },
  { Header: 'Mileage', accessor: 'Mileage' },
  { Header: 'Status', accessor: 'VehicleStatus' },
  { Header: 'License Plate', accessor: 'LicensePlateNumber' },
  { Header: 'VIN', accessor: 'VIN' },
  { Header: 'Company', accessor: 'OwnerOrCompanyName' },
  { Header: 'Service History', accessor: 'ServiceHistory' },
  { Header: 'Insurance', accessor: 'InsuranceDetails' },
  { Header: 'Registration Policy', accessor: 'RegistrationPolicy' },
  { Header: 'Registration Expiry', accessor: 'RegistrationExpiration' },
  { Header: 'GPS ID', accessor: 'GPSDeviceID' },
  { Header: 'Purchase Date', accessor: 'PurchaseDate' },
  { Header: 'Purchase Price', accessor: 'PurchasePrice' },
  { Header: 'Assigned Driver', accessor: 'AssignedDriver' },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <>
          <button onClick={() => {
            setCurrentEditVehicle(row);
            setShowEditVehiclePopup(true);
          }}>Edit</button>
          <button onClick={() => deleteVehicle(row._id)}>Delete</button>
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

    <div className="vehicle-table">
      <h2>Vehicles</h2>
      <button onClick={handleAddVehicle}>+</button>
      <GenericTable data={vehicles} columns={vehicleColumns} />
    </div>

    {showAddDriverPopup && (
      <GenericPopup show={showAddDriverPopup} onClose={() => setShowAddDriverPopup(false)}>
        <AddDriverPopup onSave={handleSaveDriver} onClose={() => setShowAddDriverPopup(false)} />
      </GenericPopup>
    )}

    {showAddVehiclePopup && (
      <GenericPopup show={showAddVehiclePopup} onClose={() => setShowAddVehiclePopup(false)}>
        <AddVehiclePopup onSave={handleSaveVehicle} onClose={() => setShowAddVehiclePopup(false)} />
      </GenericPopup>
    )}

    {showEditDriverPopup && (
      <GenericPopup show={showEditDriverPopup} onClose={() => setShowEditDriverPopup(false)}>
        <EditDriverPopup driver={currentEditDriver || {}} onSave={handleSaveDriver} onClose={() => setShowEditDriverPopup(false)} />
      </GenericPopup>
    )}

    {showEditVehiclePopup && (
      <GenericPopup show={showEditVehiclePopup} onClose={() => setShowEditVehiclePopup(false)}>
        <EditVehiclePopup vehicle={currentEditVehicle || {}} onSave={handleSaveVehicle} onClose={() => setShowEditVehiclePopup(false)} />
      </GenericPopup>
    )}
    </div>
  );
};

export default DriverAndVehicleManagement;