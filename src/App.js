import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation} from 'react-router-dom';
import './App.css';
import logo from './logo128.png';
import DashboardOverview from './pages/DashboardOverview';
import FleetTracking from './pages/FleetTracking';
import AnalyticsReporting from './pages/AnalyticsReporting';
import AddCargo from './pages/AddCargo';
import UnfulfilledCargo from './pages/UnfulfilledCargo';
import LoadOptimization from './pages/LoadOptimization';
import RouteOptimization from './pages/RouteOptimization';
import DriverManagement from './pages/DriverManagement';
import MaintenanceScheduling from './pages/MaintenanceScheduling';
import SettingsSupport from './pages/SettingsSupport';

function ButtonGrid() {
  return (
    <div className="container">
      <div className="button-grid">
        <Link to="/dashboard-overview"><button className="dashboard-button">Dashboard Overview</button></Link>
        <Link to="/fleet-tracking"><button className="dashboard-button">Fleet Tracking</button></Link>
        <Link to="/analytics-reporting"><button className="dashboard-button">Analytics & Reporting</button></Link>
        <Link to="/add-cargo"><button className="dashboard-button">Add Cargo</button></Link>
        <Link to="/unfulfilled-cargo"><button className="dashboard-button">Unfulfilled Cargo</button></Link>
        <Link to="/load-optimization"><button className="dashboard-button">Load Optimization</button></Link>
        <Link to="/route-optimization"><button className="dashboard-button">Route Optimization</button></Link>
        <Link to="/driver-management"><button className="dashboard-button">Driver Management</button></Link>
        <Link to="/maintenance-scheduling"><button className="dashboard-button">Maintenance Scheduling</button></Link>
        <Link to="/settings-support"><button className="dashboard-button">Settings & Support</button></Link>
      </div>
    </div>
  );
}

function App() {
  const [backgroundClass, setBackgroundClass] = useState('');

  // Component to listen to location changes
  const LocationListener = () => {
    const location = useLocation();
    useEffect(() => {
      // Update background class based on the path
      setBackgroundClass(location.pathname === '/' ? '' : 'route-background');
    }, [location]);

    return null; // This component doesn't render anything
  };

  return (
    <Router>
      <LocationListener /> {/* This component listens to location changes */}
      {/* Add the dynamic class along with the 'App' class */}
      <div className={`App ${backgroundClass}`}>
        <div className="header-container">
        <Link to="/">
          <img src={logo} className="logo" alt="Fleetware Logo" />
        </Link>
          <h1 className="title">Fleetware</h1>
        </div>
        <Routes>
          <Route path="/" element={<ButtonGrid />} />
          <Route path="/dashboard-overview" element={<DashboardOverview />} />
          <Route path="/fleet-tracking" element={<FleetTracking />} />
          <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
          <Route path="/add-cargo" element={<AddCargo />} />
          <Route path="/unfulfilled-cargo" element={<UnfulfilledCargo />} />
          <Route path="/load-optimization" element={<LoadOptimization />} />
          <Route path="/route-optimization" element={<RouteOptimization />} />
          <Route path="/driver-management" element={<DriverManagement />} />
          <Route path="/maintenance-scheduling" element={<MaintenanceScheduling />} />
          <Route path="/settings-support" element={<SettingsSupport />} />
          <Route path="/unfulfilled-cargo" element={<UnfulfilledCargo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;