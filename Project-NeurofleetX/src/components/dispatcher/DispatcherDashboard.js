import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import FleetMap from './FleetMap';
import FleetStatus from './FleetStatus';
import TripManagement from './TripManagement';

const DispatcherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('map');
  const [stats, setStats] = useState({
    availableVehicles: 0,
    availableDrivers: 0,
    activeTrips: 0,
    pendingTrips: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        axios.get('/api/vehicles/available'),
        axios.get('/api/drivers/available'),
        axios.get('/api/trips')
      ]);

      const activeTrips = tripsRes.data.filter(trip => 
        trip.status === 'IN_PROGRESS' || trip.status === 'ASSIGNED'
      ).length;

      const pendingTrips = tripsRes.data.filter(trip => 
        trip.status === 'REQUESTED'
      ).length;

      setStats({
        availableVehicles: vehiclesRes.data.length,
        availableDrivers: driversRes.data.length,
        activeTrips,
        pendingTrips
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const tabs = [
    { id: 'map', label: 'Fleet Map', component: FleetMap },
    { id: 'trips', label: 'Trip Management', component: TripManagement },
    { id: 'fleet', label: 'Fleet Status', component: FleetStatus }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">NeuroFleetX - Dispatcher Dashboard</div>
          <div>
            <span style={{ marginRight: '20px' }}>Welcome, {user?.firstName}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Real-time Statistics */}
        <div className="grid grid-4" style={{ marginBottom: '30px' }}>
          <div className="card">
            <h3>Available Vehicles</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats.availableVehicles}
            </p>
          </div>
          <div className="card">
            <h3>Available Drivers</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats.availableDrivers}
            </p>
          </div>
          <div className="card">
            <h3>Active Trips</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {stats.activeTrips}
            </p>
          </div>
          <div className="card">
            <h3>Pending Trips</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.pendingTrips}
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
          
          {ActiveComponent && (
            <div className="content-fullheight">
              <ActiveComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatcherDashboard;
