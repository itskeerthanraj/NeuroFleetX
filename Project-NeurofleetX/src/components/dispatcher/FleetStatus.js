import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FleetStatus = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axios.get('/api/vehicles'),
        axios.get('/api/drivers')
      ]);

      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      toast.error('Failed to fetch fleet data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, type) => {
    const statusClasses = {
      vehicle: {
        AVAILABLE: 'status-available',
        BUSY: 'status-busy',
        MAINTENANCE: 'status-maintenance',
        OFFLINE: 'status-offline'
      },
      driver: {
        AVAILABLE: 'status-available',
        BUSY: 'status-busy',
        OFFLINE: 'status-offline',
        BREAK: 'status-maintenance'
      }
    };
    
    return (
      <span className={`status-badge ${statusClasses[type][status]}`}>
        {status}
      </span>
    );
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown';
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : 'Unknown';
  };

  if (loading) {
    return <div>Loading fleet status...</div>;
  }

  return (
    <div>
      <h2>Fleet Status Overview</h2>
      
      {/* Vehicle Status */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>Vehicle Status</h3>
        <div className="grid grid-4" style={{ marginBottom: '20px' }}>
          <div>
            <h4>Available</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
              {vehicles.filter(v => v.status === 'AVAILABLE').length}
            </p>
          </div>
          <div>
            <h4>Busy</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
              {vehicles.filter(v => v.status === 'BUSY').length}
            </p>
          </div>
          <div>
            <h4>Maintenance</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>
              {vehicles.filter(v => v.status === 'MAINTENANCE').length}
            </p>
          </div>
          <div>
            <h4>Offline</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c757d' }}>
              {vehicles.filter(v => v.status === 'OFFLINE').length}
            </p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>License Plate</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Make/Model</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Driver</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{vehicle.licensePlate}</td>
                <td style={{ padding: '10px' }}>{vehicle.make} {vehicle.model}</td>
                <td style={{ padding: '10px' }}>{vehicle.type}</td>
                <td style={{ padding: '10px' }}>{getStatusBadge(vehicle.status, 'vehicle')}</td>
                <td style={{ padding: '10px' }}>
                  {vehicle.driverId ? getDriverName(vehicle.driverId) : 'Unassigned'}
                </td>
                <td style={{ padding: '10px' }}>
                  {vehicle.lastUpdated ? new Date(vehicle.lastUpdated).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Driver Status */}
      <div className="card">
        <h3>Driver Status</h3>
        <div className="grid grid-4" style={{ marginBottom: '20px' }}>
          <div>
            <h4>Available</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
              {drivers.filter(d => d.status === 'AVAILABLE').length}
            </p>
          </div>
          <div>
            <h4>Busy</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
              {drivers.filter(d => d.status === 'BUSY').length}
            </p>
          </div>
          <div>
            <h4>On Break</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>
              {drivers.filter(d => d.status === 'BREAK').length}
            </p>
          </div>
          <div>
            <h4>Offline</h4>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c757d' }}>
              {drivers.filter(d => d.status === 'OFFLINE').length}
            </p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Assigned Vehicle</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{driver.firstName} {driver.lastName}</td>
                <td style={{ padding: '10px' }}>{driver.email}</td>
                <td style={{ padding: '10px' }}>{driver.phoneNumber}</td>
                <td style={{ padding: '10px' }}>{getStatusBadge(driver.status, 'driver')}</td>
                <td style={{ padding: '10px' }}>
                  {driver.vehicleId ? getVehicleInfo(driver.vehicleId) : 'No vehicle assigned'}
                </td>
                <td style={{ padding: '10px' }}>
                  {driver.lastActive ? new Date(driver.lastActive).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetStatus;
