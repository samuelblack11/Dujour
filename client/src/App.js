import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import logo from './assets/logo128.png';
import OperationsOverview from './pages/OperationsOverview';
import AnalyticsReporting from './pages/AnalyticsReporting';
import MenuManagement from './pages/MenuManagement';
import BuildOrder from './pages/BuildOrder';
import OrderManagement from './pages/OrderManagement';
import RouteOptimization from './pages/RouteOptimization';
import DriverManagement from './pages/DriverManagement';
import SettingsSupport from './pages/SettingsSupport';
import MyOrders from './pages/MyOrders';
import Login from './Login'; // Assume you have a Login component

// Authentication context
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

function ButtonGrid() {
  const { user } = useAuth();
  // Render buttons based on user role
  return (
    <div className="container">
      <div className="button-grid">
        {user.role === 'admin' && (
          <>
            <Link to="/operations-overview"><button className="dashboard-button">Operations Overview</button></Link>
            <Link to="/analytics-reporting"><button className="dashboard-button">Analytics & Reporting</button></Link>
            <Link to="/menu-management"><button className="dashboard-button">Menu Management</button></Link>
            <Link to="/order-management"><button className="dashboard-button">Order Management</button></Link>
            <Link to="/route-optimization"><button className="dashboard-button">Route Optimization</button></Link>
            <Link to="/driver-management"><button className="dashboard-button">Driver Management</button></Link>
          </>
        )}
        <Link to="/build-order"><button className="dashboard-button">Build Order</button></Link>
        <Link to="/my-orders"><button className="dashboard-button">My Orders</button></Link>
        <Link to="/settings-support"><button className="dashboard-button">Settings & Support</button></Link>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null); // Store user role and authentication status
  const [backgroundClass, setBackgroundClass] = useState('');

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Check local storage for user info on initial load
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Component to listen to location changes
  const LocationListener = () => {
    const location = useLocation();
    useEffect(() => {
      setBackgroundClass(location.pathname === '/' ? '' : 'route-background');
    }, [location]);

    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <LocationListener />
        <div className={`App ${backgroundClass}`}>
          <div className="header-container">
            <Link to="/">
              <img src={logo} className="logo" alt="Dujour Logo" />
            </Link>
            <h2 className="header-title">Dujour: A Farm to Consumer Concept</h2>
          </div>
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<ButtonGrid />} />
                {user.role === 'admin' && (
                  <>
                    <Route path="/operations-overview" element={<OperationsOverview />} />
                    <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
                    <Route path="/menu-management" element={<MenuManagement />} />
                    <Route path="/order-management" element={<OrderManagement />} />
                    <Route path="/route-optimizaiton" element={<RouteOptimization />} />
                    <Route path="/driver-management" element={<DriverManagement />} />
                  </>
                )}
                <Route path="/build-order" element={<BuildOrder />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/settings-support" element={<SettingsSupport />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
