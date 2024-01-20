import React from 'react';

const DashboardButtons = () => {
    return (
        <div className="container">
            <div className="button-grid">
                <button className="dashboard-button">Dashboard Overview</button>
                <button className="dashboard-button">Fleet Tracking</button>
                <button className="dashboard-button">Load Optimization</button>
                <button className="dashboard-button">Analytics & Reporting</button>
                <button className="dashboard-button">Route Optimization</button>
                <button className="dashboard-button">Driver Management</button>
                <button className="dashboard-button">Maintenance Scheduling</button>
                <button className="dashboard-button">Settings & Support</button>
            </div>
        </div>
    );
};

export default DashboardButtons;
