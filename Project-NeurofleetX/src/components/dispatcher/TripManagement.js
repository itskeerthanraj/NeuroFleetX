import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    passengerId: '',
    pickupLocation: { latitude: 0, longitude: 0, address: '' },
    dropoffLocation: { latitude: 0, longitude: 0, address: '' },
    fare: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get('/api/trips'),
        axios.get('/api/vehicles/available'),
        axios.get('/api/drivers/available')
      ]);

      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/trips', formData);
      toast.success('Trip created successfully');
      setShowForm(false);
      setFormData({
        passengerId: '',
        pickupLocation: { latitude: 0, longitude: 0, address: '' },
        dropoffLocation: { latitude: 0, longitude: 0, address: '' },
        fare: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create trip');
    }
  };

  const handleAssignTrip = async (tripId, driverId, vehicleId) => {
    try {
      await axios.put(`/api/trips/${tripId}/assign`, null, {
        params: { driverId, vehicleId }
      });
      toast.success('Trip assigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign trip');
    }
  };

  const handleOptimizeTrip = async (tripId) => {
    try {
      const response = await axios.post(`/api/trips/${tripId}/optimize`);
      const { driverId, vehicleId } = response.data;
      
      if (driverId && vehicleId) {
        await handleAssignTrip(tripId, driverId, vehicleId);
        toast.success('Trip optimized and assigned automatically');
      } else {
        toast.warning('No optimal assignment found');
      }
    } catch (error) {
      toast.error('Failed to optimize trip');
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await axios.put(`/api/trips/${tripId}/cancel`);
        toast.success('Trip cancelled successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel trip');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      REQUESTED: 'status-maintenance',
      ASSIGNED: 'status-busy',
      IN_PROGRESS: 'status-available',
      COMPLETED: 'status-available',
      CANCELLED: 'status-offline'
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
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
    return <div>Loading trips...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Trip Management</h2>
        <button 
          className="btn btn-success" 
          onClick={() => setShowForm(true)}
        >
          Create New Trip
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Create New Trip</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Passenger ID:</label>
                <input
                  type="text"
                  value={formData.passengerId}
                  onChange={(e) => setFormData({...formData, passengerId: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fare Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fare}
                  onChange={(e) => setFormData({...formData, fare: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pickup Address:</label>
                <input
                  type="text"
                  value={formData.pickupLocation.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    pickupLocation: {...formData.pickupLocation, address: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dropoff Address:</label>
                <input
                  type="text"
                  value={formData.dropoffLocation.address}
                  onChange={(e) => setFormData({
                    ...formData, 
                    dropoffLocation: {...formData.dropoffLocation, address: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pickup Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.pickupLocation.latitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    pickupLocation: {...formData.pickupLocation, latitude: parseFloat(e.target.value)}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pickup Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.pickupLocation.longitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    pickupLocation: {...formData.pickupLocation, longitude: parseFloat(e.target.value)}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dropoff Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.dropoffLocation.latitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    dropoffLocation: {...formData.dropoffLocation, latitude: parseFloat(e.target.value)}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dropoff Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={formData.dropoffLocation.longitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    dropoffLocation: {...formData.dropoffLocation, longitude: parseFloat(e.target.value)}
                  })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
              />
            </div>
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success" style={{ marginRight: '10px' }}>
                Create Trip
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Trip ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Passenger</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Pickup</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Dropoff</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Fare</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Driver</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vehicle</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>#{trip.id.substring(0, 8)}</td>
                <td style={{ padding: '10px' }}>{trip.passengerId}</td>
                <td style={{ padding: '10px' }}>{trip.pickupLocation?.address || 'N/A'}</td>
                <td style={{ padding: '10px' }}>{trip.dropoffLocation?.address || 'N/A'}</td>
                <td style={{ padding: '10px' }}>${trip.fare || '0.00'}</td>
                <td style={{ padding: '10px' }}>{getStatusBadge(trip.status)}</td>
                <td style={{ padding: '10px' }}>{trip.driverId ? getDriverName(trip.driverId) : 'Unassigned'}</td>
                <td style={{ padding: '10px' }}>{trip.vehicleId ? getVehicleInfo(trip.vehicleId) : 'Unassigned'}</td>
                <td style={{ padding: '10px' }}>
                  {trip.status === 'REQUESTED' && (
                    <>
                      <button 
                        className="btn btn-success" 
                        style={{ marginRight: '5px', padding: '5px 10px' }}
                        onClick={() => handleOptimizeTrip(trip.id)}
                      >
                        Auto Assign
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '5px 10px' }}
                        onClick={() => handleCancelTrip(trip.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {trip.status === 'ASSIGNED' && (
                    <button 
                      className="btn btn-warning" 
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleCancelTrip(trip.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripManagement;
