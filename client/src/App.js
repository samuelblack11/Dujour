import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import SupplierScheduling from './pages/SupplierScheduling';
import OrderSortation from './pages/OrderSortation';
import OnRoadOverview from './pages/OnRoadOverview';

import Login from './pages/Login';
export const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

function ButtonGrid() {
  const { user } = useAuth();
  // Render buttons based on user role
  return (
    <div className="container">
      <div className="button-grid">
        <Link to="/build-order"><button className="dashboard-button">Build Order</button></Link>
        <Link to="/my-orders"><button className="dashboard-button">My Orders</button></Link>
        {user.role === 'admin' && (
          <>
            <Link to="/supplier-scheduling"><button className="dashboard-button">Supplier Scheduling</button></Link>
            <Link to="/menu-management"><button className="dashboard-button">Menu Management</button></Link>
            <Link to="/order-management"><button className="dashboard-button">Order Management</button></Link>
            <Link to="/route-optimization"><button className="dashboard-button">Route Optimization</button></Link>
            <Link to="/driver-management"><button className="dashboard-button">Driver Management</button></Link>
            <Link to="/order-sortation"><button className="dashboard-button">Order Sortation</button></Link>
            <Link to="/onroad-overview"><button className="dashboard-button">On Road Overview</button></Link>
            {/* <Link to="/operations-overview"><button className="dashboard-button">Operations Overview</button></Link>*/}
            {/* <Link to="/analytics-reporting"><button className="dashboard-button">Analytics & Reporting</button></Link>*/}
          </>
        )}
        {/*<Link to="/settings-support"><button className="dashboard-button">Settings & Support</button></Link>*/}
      </div>
    </div>
  );
}

function SettingsButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-button-container">
      <button onClick={toggleDropdown} className="settings-button">
        Settings
      </button>
      {showDropdown && (
        <div className="dropdown-menu">
          <Link to="/my-account" className="dropdown-item">My Account</Link>
          <button onClick={handleLogout} className="dropdown-item">Logout</button>
        </div>
      )}
    </div>
  );
}

function LogoutButton() {
  const navigate = useNavigate(); // Now it's called within the context of <Router>
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
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

    const handleLogout = () => {
    logout(); // Call the logout function from your AuthContext
    navigate('/'); // Redirect to login page
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
          <div className="header-content">
            <Link to="/">
              <img src={logo} className="logo" alt="Dujour Logo" />
            </Link>
            <h2 className="header-title">Dujour: A Farm to Consumer Concept</h2>
          </div>
          {user && <SettingsButton />} {/* Positioned to the right */}
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
                    <Route path="/order-management" element={<OrderManagement mode="allOrders" />} />
                    <Route path="/route-optimization" element={<RouteOptimization />} />
                    <Route path="/driver-management" element={<DriverManagement />} />
                    <Route path="/supplier-scheduling" element={<SupplierScheduling />} />
                    <Route path="/order-sortation" element={<OrderSortation />} />
                    <Route path="/onroad-overview" element={<OnRoadOverview />} />
                  </>
                )}
                <Route path="/build-order" element={<BuildOrder />} />
                <Route path="/my-orders" element={<OrderManagement mode="myOrders" />} />
                <Route path="/settings-support" element={<SettingsSupport />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
