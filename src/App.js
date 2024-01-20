import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import logo from './logo.png';
import DashboardOverview from './pages/DashboardOverview';
import FleetTracking from './pages/FleetTracking';
import LoadOptimization from './pages/LoadOptimization';
import AnalyticsReporting from './pages/AnalyticsReporting';
import RouteOptimization from './pages/RouteOptimization';
import DriverManagement from './pages/DriverManagement';
import MaintenanceScheduling from './pages/MaintenanceScheduling';
import SettingsSupport from './pages/SettingsSupport';

function App() {
  return (
    <Router>
      <div className="App">
        <h1 className="title">Fleetware</h1>
        <img src={logo} className="logo" alt="Fleetware Logo" />
        
        {/* Dashboard Buttons */}
        <div className="container">
          <div className="button-grid">
            <Link to="/dashboard-overview"><button className="dashboard-button">Dashboard Overview</button></Link>
            <Link to="/fleet-tracking"><button className="dashboard-button">Fleet Tracking</button></Link>
            <Link to="/load-optimization"><button className="dashboard-button">Load Optimization</button></Link>
            <Link to="/analytics-reporting"><button className="dashboard-button">Analytics & Reporting</button></Link>
            <Link to="/route-optimization"><button className="dashboard-button">Route Optimization</button></Link>
            <Link to="/driver-management"><button className="dashboard-button">Driver Management</button></Link>
            <Link to="/maintenance-scheduling"><button className="dashboard-button">Maintenance Scheduling</button></Link>
            <Link to="/settings-support"><button className="dashboard-button">Settings & Support</button></Link>
          </div>
        </div>
        {/* Routes */}
        <Routes>
          <Route path="/dashboard-overview" component={DashboardOverview} />
          <Route path="/fleet-tracking" component={FleetTracking} />
          <Route path="/load-optimization" component={LoadOptimization} />
          <Route path="/analytics-reporting" component={AnalyticsReporting} />
          <Route path="/route-optimization" component={RouteOptimization} />
          <Route path="/driver-management" component={DriverManagement} />
          <Route path="/maintenance-scheduling" component={MaintenanceScheduling} />
          <Route path="/settings-support" component={SettingsSupport} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
