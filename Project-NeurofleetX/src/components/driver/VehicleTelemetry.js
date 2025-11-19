import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const VehicleTelemetry = ({ vehicle }) => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicle?.id) {
      fetchTelemetryData();
      generateHistoricalData();
    }
  }, [vehicle?.id]);

  const fetchTelemetryData = async () => {
    try {
      // In a real app, you'd fetch actual telemetry data
      // For demo purposes, we'll generate simulated data
      const simulatedData = {
        speed: Math.floor(Math.random() * 80) + 20, // 20-100 km/h
        fuelLevel: Math.floor(Math.random() * 100), // 0-100%
        engineTemperature: Math.floor(Math.random() * 40) + 80, // 80-120°C
        batteryLevel: Math.floor(Math.random() * 100), // 0-100%
        engineOn: Math.random() > 0.1, // 90% chance engine is on
        doorsLocked: Math.random() > 0.2, // 80% chance doors are locked
        odometer: (Math.random() * 100000) + 50000, // 50k-150k km
        timestamp: new Date()
      };
      
      setTelemetryData(simulatedData);
    } catch (error) {
      toast.error('Failed to fetch telemetry data');
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = () => {
    // Generate historical data for charts
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.getHours() + ':00';
      
      data.push({
        time: hourStr,
        speed: Math.floor(Math.random() * 80) + 20,
        fuelLevel: Math.floor(Math.random() * 100),
        engineTemperature: Math.floor(Math.random() * 40) + 80,
        batteryLevel: Math.floor(Math.random() * 100)
      });
    }
    
    setHistoricalData(data);
  };

  // Update telemetry data every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchTelemetryData, 10000);
    return () => clearInterval(interval);
  }, [vehicle?.id]);

  if (loading) {
    return <div>Loading vehicle telemetry...</div>;
  }

  if (!telemetryData) {
    return <div>No telemetry data available</div>;
  }

  return (
    <div>
      <h2>Vehicle Telemetry</h2>
      
      {/* Vehicle Information */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>Vehicle Information</h3>
        <div className="grid grid-3">
          <div>
            <p><strong>Make/Model:</strong> {vehicle?.make} {vehicle?.model}</p>
            <p><strong>License Plate:</strong> {vehicle?.licensePlate}</p>
            <p><strong>Type:</strong> {vehicle?.type}</p>
          </div>
          <div>
            <p><strong>Status:</strong> {vehicle?.status}</p>
            <p><strong>Year:</strong> {vehicle?.year}</p>
            <p><strong>Color:</strong> {vehicle?.color}</p>
          </div>
          <div>
            <p><strong>Odometer:</strong> {telemetryData.odometer.toFixed(0)} km</p>
            <p><strong>Engine:</strong> {telemetryData.engineOn ? 'Running' : 'Off'}</p>
            <p><strong>Doors:</strong> {telemetryData.doorsLocked ? 'Locked' : 'Unlocked'}</p>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="card">
          <h4>Speed</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
            {telemetryData.speed} km/h
          </p>
        </div>
        <div className="card">
          <h4>Fuel Level</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {telemetryData.fuelLevel}%
          </p>
        </div>
        <div className="card">
          <h4>Engine Temperature</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
            {telemetryData.engineTemperature}°C
          </p>
        </div>
        <div className="card">
          <h4>Battery Level</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
            {telemetryData.batteryLevel}%
          </p>
        </div>
      </div>

      {/* Historical Charts */}
      <div className="grid grid-2" style={{ marginBottom: '30px' }}>
        <div className="card">
          <h3>Speed & Fuel Level (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="speed" stroke="#007bff" strokeWidth={2} />
              <Line type="monotone" dataKey="fuelLevel" stroke="#28a745" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>Engine Temperature & Battery (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="engineTemperature" stroke="#dc3545" strokeWidth={2} />
              <Line type="monotone" dataKey="batteryLevel" stroke="#ffc107" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="card">
        <h3>Vehicle Status</h3>
        <div className="grid grid-2">
          <div>
            <h4>Engine Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: telemetryData.engineOn ? '#28a745' : '#dc3545', 
                borderRadius: '50%', 
                marginRight: '10px' 
              }}></div>
              <span>{telemetryData.engineOn ? 'Engine Running' : 'Engine Off'}</span>
            </div>
            
            <h4>Door Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: telemetryData.doorsLocked ? '#28a745' : '#ffc107', 
                borderRadius: '50%', 
                marginRight: '10px' 
              }}></div>
              <span>{telemetryData.doorsLocked ? 'Doors Locked' : 'Doors Unlocked'}</span>
            </div>
          </div>
          
          <div>
            <h4>Fuel Level</h4>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${telemetryData.fuelLevel}%`, 
                  height: '100%', 
                  backgroundColor: telemetryData.fuelLevel < 20 ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontSize: '14px', color: '#6c757d' }}>
                {telemetryData.fuelLevel}% remaining
              </span>
            </div>
            
            <h4>Battery Level</h4>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${telemetryData.batteryLevel}%`, 
                  height: '100%', 
                  backgroundColor: telemetryData.batteryLevel < 30 ? '#dc3545' : '#ffc107',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontSize: '14px', color: '#6c757d' }}>
                {telemetryData.batteryLevel}% remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px', marginTop: '20px' }}>
        Last updated: {telemetryData.timestamp.toLocaleString()}
      </div>
    </div>
  );
};

export default VehicleTelemetry;