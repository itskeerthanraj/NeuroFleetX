import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import VehicleManagement from './VehicleManagement';
import DriverManagement from './DriverManagement';
import SystemMonitoring from './SystemMonitoring';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('vehicles');
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalDrivers: 0,
    activeTrips: 0,
    totalTrips: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        axios.get('/api/vehicles'),
        axios.get('/api/drivers'),
        axios.get('/api/trips')
      ]);

      const activeTrips = tripsRes.data.filter(trip => 
        trip.status === 'IN_PROGRESS' || trip.status === 'ASSIGNED'
      ).length;

      setStats({
        totalVehicles: vehiclesRes.data.length,
        totalDrivers: driversRes.data.length,
        activeTrips,
        totalTrips: tripsRes.data.length
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const tabs = [
    { id: 'vehicles', label: 'Vehicle Management', component: VehicleManagement },
    { id: 'drivers', label: 'Driver Management', component: DriverManagement },
    { id: 'monitoring', label: 'System Monitoring', component: SystemMonitoring }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">NeuroFleetX - Admin Dashboard</div>
          <div>
            <span style={{ marginRight: '20px' }}>Welcome, {user?.firstName}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Statistics Cards */}
        <div className="grid grid-4" style={{ marginBottom: '30px' }}>
          <div className="card">
            <h3>Total Vehicles</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats.totalVehicles}
            </p>
          </div>
          <div className="card">
            <h3>Total Drivers</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.totalDrivers}
            </p>
          </div>
          <div className="card">
            <h3>Active Trips</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.activeTrips}
            </p>
          </div>
          <div className="card">
            <h3>Total Trips</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.totalTrips}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`btn ${activeTab === tab.id ? 'btn-success' : ''}`}
                style={{ 
                  marginRight: '10px', 
                  borderRadius: activeTab === tab.id ? '4px 4px 0 0' : '4px',
                  backgroundColor: activeTab === tab.id ? '#28a745' : '#6c757d'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
