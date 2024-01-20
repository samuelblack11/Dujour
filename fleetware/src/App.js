import React from 'react';
import './App.css';
import DashboardButtons from './DashboardButtons';
import logo from './logo.png'; 

function App() {
  return (
    <div className="App">
      <h1 className="title">Fleetware</h1>
      {<img src={logo} className="logo" alt="Fleetware Logo" />}
      <DashboardButtons />
    </div>
  );
}

export default App;
