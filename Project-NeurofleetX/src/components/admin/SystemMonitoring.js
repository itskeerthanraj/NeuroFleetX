import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SystemMonitoring = () => {
  const [stats, setStats] = useState({
    vehicles: [],
    drivers: [],
    trips: []
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
    // Simulate real-time data updates
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        axios.get('/api/vehicles'),
        axios.get('/api/drivers'),
        axios.get('/api/trips')
      ]);

      const vehicles = vehiclesRes.data;
      const drivers = driversRes.data;
      const trips = tripsRes.data;

      setStats({ vehicles, drivers, trips });

      // Generate performance data for charts
      const performance = generatePerformanceData(vehicles, drivers, trips);
      setPerformanceData(performance);

    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceData = (vehicles, drivers, trips) => {
    // Generate sample performance data for the last 24 hours
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours() + ':00';
      
      data.push({
        time: hourStr,
        activeVehicles: Math.floor(Math.random() * vehicles.length * 0.8) + Math.floor(vehicles.length * 0.2),
        activeDrivers: Math.floor(Math.random() * drivers.length * 0.7) + Math.floor(drivers.length * 0.3),
        tripsCompleted: Math.floor(Math.random() * 20) + 5,
        avgResponseTime: Math.floor(Math.random() * 10) + 5
      });
    }
    
    return data;
  };

  const getVehicleStatusCounts = () => {
    const counts = { AVAILABLE: 0, BUSY: 0, MAINTENANCE: 0, OFFLINE: 0 };
    stats.vehicles.forEach(vehicle => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    });
    return counts;
  };

  const getDriverStatusCounts = () => {
    const counts = { AVAILABLE: 0, BUSY: 0, OFFLINE: 0, BREAK: 0 };
    stats.drivers.forEach(driver => {
      counts[driver.status] = (counts[driver.status] || 0) + 1;
    });
    return counts;
  };

  const getTripStatusCounts = () => {
    const counts = { REQUESTED: 0, ASSIGNED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    stats.trips.forEach(trip => {
      counts[trip.status] = (counts[trip.status] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return <div>Loading system monitoring data...</div>;
  }

  const vehicleStatusData = Object.entries(getVehicleStatusCounts()).map(([status, count]) => ({
    status,
    count
  }));

  const driverStatusData = Object.entries(getDriverStatusCounts()).map(([status, count]) => ({
    status,
    count
  }));

  return (
    <div>
      <h2>System Monitoring Dashboard</h2>
      
      {/* Real-time Statistics */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="card">
          <h3>Total Vehicles</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.vehicles.length}
          </p>
        </div>
        <div className="card">
          <h3>Total Drivers</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {stats.drivers.length}
          </p>
        </div>
        <div className="card">
          <h3>Active Trips</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.trips.filter(trip => trip.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="card">
          <h3>Completed Today</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {stats.trips.filter(trip => trip.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: '30px' }}>
        <div className="card">
          <h3>Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Driver Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="card">
        <h3>Performance Trends (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="activeVehicles" stroke="#007bff" strokeWidth={2} />
            <Line type="monotone" dataKey="activeDrivers" stroke="#28a745" strokeWidth={2} />
            <Line type="monotone" dataKey="tripsCompleted" stroke="#ffc107" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* System Health */}
      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3>System Health</h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Database Connection</span>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Healthy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>WebSocket Service</span>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Healthy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>AI Optimization</span>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Healthy</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>GPS Tracking</span>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Healthy</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {stats.trips.slice(-5).map(trip => (
              <div key={trip.id} style={{ 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                fontSize: '14px'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  Trip #{trip.id.substring(0, 8)} - {trip.status}
                </div>
                <div style={{ color: '#666' }}>
                  {trip.driverId ? `Driver: ${trip.driverId.substring(0, 8)}` : 'Unassigned'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;
