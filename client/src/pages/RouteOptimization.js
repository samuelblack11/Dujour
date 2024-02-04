import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllPages.css';

const LoadOptimization = () => {
const [drivers, setDrivers] = useState([]);
const [vehicles, setVehicles] = useState([]);
const [selectedDriver, setSelectedDriver] = useState('');
const [selectedVehicle, setSelectedVehicle] = useState('');
const [cargoAssignmentMethod, setCargoAssignmentMethod] = useState('');
const [cargoList, setCargoList] = useState([]);
const [selectedCargo, setSelectedCargo] = useState([]);
const [routeDuration, setRouteDuration] = useState('');
const [routeRegion, setRouteRegion] = useState('');
const [filteredCargo, setFilteredCargo] = useState([]);


  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get('/api/drivers');
        setDrivers(response.data);
      } catch (error) {
        console.error("Error fetching drivers", error);
      }
    };

    const fetchVehicles = async () => {
      try {
        const response = await axios.get('/api/vehicles');
        setVehicles(response.data);
      } catch (error) {
        console.error("Error fetching vehicles", error);
      }
    };

    const fetchCargo = async () => {
      try {
        const response = await axios.get('/api/cargo');
        setCargoList(response.data);
      } catch (error) {
        console.error("Error fetching cargo", error);
      }
    };

    fetchCargo();
    fetchDrivers();
    fetchVehicles();
  }, []);

  const FilteredCargoList = ({ cargo }) => {
  return (
    <div>
      {cargo.map(item => (
        <div key={item._id}>
          {/* Display cargo details */}
          {item.customerName} - {item.routeRegion}
          {/* Add other relevant details */}
        </div>
      ))}
    </div>
  );
};

const RouteDataDisplay = ({ selectedCargo }) => {
  // Placeholder values, replace with actual calculations
  const selectedCargoDetails = cargoList.filter(cargo => selectedCargo.includes(cargo._id));
  const totalVolume = selectedCargoDetails.reduce((acc, cargo) => acc + (cargo.cargoLength * cargo.cargoWidth * cargo.cargoHeight), 0);
  const totalWeight = selectedCargoDetails.reduce((acc, cargo) => acc + cargo.cargoWeight, 0);
  const estimatedDuration = 'TBD';

  return (
    <div>
    <h3>Route Data</h3>
      <p>Total Volume: {totalVolume} cubic ft</p>
      <p>Total Weight: {totalWeight} lbs</p>
      <p>Estimated Duration: {estimatedDuration}</p>
    </div>
  );
};

useEffect(() => {
  const filtered = cargoList.filter(cargo => 
    cargo.deliveryAddress.toLowerCase().includes(routeRegion.toLowerCase())
  );
  setFilteredCargo(filtered);
}, [routeRegion, cargoList]);

  const handleDriverChange = (e) => {
    setSelectedDriver(e.target.value);
  };

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the submission logic here
    console.log("Selected Driver:", selectedDriver);
    console.log("Selected Vehicle:", selectedVehicle);
    // You can add the cargo handling logic here
  };

  const handleCargoAssignmentMethodChange = (e) => {
  setCargoAssignmentMethod(e.target.value);
  setSelectedCargo([]);
};

const handleRouteRegionChange = (e) => {
  console.log("Updating Route Region:", e.target.value);
  setRouteRegion(e.target.value);
};


const CargoList = ({ cargo, onCargoSelect, selectedCargo }) => {
  return (
    <div>
    <h3>Regional Cargo</h3>
      {cargo.map(item => (
        <div key={item._id}>
          <input
            type="checkbox"
            checked={selectedCargo.includes(item._id)}
            onChange={() => onCargoSelect(item._id)}
          />
          {item.customerName} - {item.cargoCategory}
          <div>Weight: {item.cargoWeight} lbs</div>
          <div>Dimensions: {item.cargoLength}x{item.cargoWidth}x{item.cargoHeight} ft</div>
          <div>Value: ${item.cargoValue}</div>
          <div>Delivery Address: {item.deliveryAddress}</div>
          {/* Add other relevant details */}
        </div>
      ))}
    </div>
  );
};

  const handleCargoSelect = (cargoId) => {
    if (selectedCargo.includes(cargoId)) {
      setSelectedCargo(selectedCargo.filter(id => id !== cargoId));
    } else {
      setSelectedCargo([...selectedCargo, cargoId]);
    }
  };

  return (
    <div className="load-optimization-container">
      <h2>Route Optimization</h2>
    <form onSubmit={handleSubmit} className="form-section">
  <div className="form-group">
        <h3>Inputs</h3>
    <label htmlFor="cargoAssignment">Cargo Assignment:</label>
    <select id="cargoAssignment" value={cargoAssignmentMethod} onChange={handleCargoAssignmentMethodChange}>
      <option value="">Select Assignment Method</option>
      <option value="manual">Manual</option>
      <option value="automatic">Automatic</option>
    </select>
  </div>
    <div className="form-group">
    <label htmlFor="routeRegion">Route Region:</label>
    <input
      type="text"
      id="routeRegion"
      name="routeRegion"
      value={routeRegion}
      onChange={(e) => setRouteRegion(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label htmlFor="routeDuration">Route Duration (minutes):</label>
    <input
      type="number"
      id="routeDuration"
      name="routeDuration"
      value={routeDuration}
      onChange={(e) => setRouteDuration(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label htmlFor="driverSelect">Select Driver:</label>
    <select id="driverSelect" value={selectedDriver} onChange={handleDriverChange}>
      <option value="">Select a Driver</option>
      {drivers.map(driver => (
        <option key={driver._id} value={driver._id}>{driver.Name}</option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label htmlFor="vehicleSelect">Select Vehicle:</label>
    <select id="vehicleSelect" value={selectedVehicle} onChange={handleVehicleChange}>
      <option value="">Select a Vehicle</option>
      {vehicles.map(vehicle => (
        <option key={vehicle._id} value={vehicle._id}>{vehicle.Make} {vehicle.Model}</option>
      ))}
    </select>
  </div>

  <button type="submit">Optimize Load</button>
</form>
{cargoAssignmentMethod === 'manual' && (
  <div className="cargo-list-section">
    <CargoList cargo={filteredCargo} onCargoSelect={handleCargoSelect} selectedCargo={selectedCargo} />
  </div>
)}

    {cargoAssignmentMethod === 'manual' && (
      <div className="route-data-section">
        <RouteDataDisplay selectedCargo={selectedCargo} cargoList={cargoList}/>
      </div>
    )}
  </div>
  );
};

export default LoadOptimization;
