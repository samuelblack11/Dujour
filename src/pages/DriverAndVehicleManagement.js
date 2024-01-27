import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericTable, GenericPopup } from './ReusableReactComponents';

// AddDriverPopup Component
const AddDriverPopup = ({ onClose, onSave }) => {
  const [driverData, setDriverData] = useState({
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
    setDriverData({ ...driverData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
     await onSave(driverData);
      onClose(); // Close the popup
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
            value={driverData[field.name]} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>Add Driver</button>
    </>
  );
};

// AddVehiclePopup Component
const AddVehiclePopup = ({ onClose, onSave }) => {
  const [vehicleData, setVehicleData] = useState({
    // ... initial vehicle data state ...
  });

  const handleChange = (e) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async () => {
    try {
      await onSave(vehicleData);
      onClose(); // Close the popup
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
            value={vehicleData[field.name]} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <button className="popup-ok-btn" onClick={handleSaveClick}>Add Vehicle</button>
    </>
  );
};

// DriverAndVehicleManagement Component
const DriverAndVehicleManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddDriverPopup, setShowAddDriverPopup] = useState(false);
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState(false);

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
  ];

  return (
    <div className="driver-vehicle-management-container">
      <div className="driver-table">
        <h2>Drivers</h2>
        <button onClick={() => setShowAddDriverPopup(true)}>+</button>
        <GenericTable data={drivers} columns={driverColumns} />
      </div>

      <div className="vehicle-table">
        <h2>Vehicles</h2>
        <button onClick={() => setShowAddVehiclePopup(true)}>+</button>
        <GenericTable data={vehicles} columns={vehicleColumns} />
      </div>

    {showAddDriverPopup && (
      <GenericPopup show={showAddDriverPopup} onClose={() => setShowAddDriverPopup(false)}>
        <AddDriverPopup onSave={addDriver} onClose={() => setShowAddDriverPopup(false)} />
      </GenericPopup>
    )}

    {showAddVehiclePopup && (
      <GenericPopup show={showAddVehiclePopup} onClose={() => setShowAddVehiclePopup(false)}>
        <AddVehiclePopup onSave={addVehicle} onClose={() => setShowAddVehiclePopup(false)} />
      </GenericPopup>
    )}
    </div>
  );
};

export default DriverAndVehicleManagement;