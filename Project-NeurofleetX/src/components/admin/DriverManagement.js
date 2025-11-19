import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    licenseNumber: '',
    vehicleId: ''
  });

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get('/api/drivers');
      setDrivers(response.data);
    } catch (error) {
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await axios.put(`/api/drivers/${editingDriver.id}`, formData);
        toast.success('Driver updated successfully');
      } else {
        await axios.post('/api/drivers', formData);
        toast.success('Driver created successfully');
      }
      setShowForm(false);
      setEditingDriver(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        licenseNumber: '',
        vehicleId: ''
      });
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      vehicleId: driver.vehicleId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axios.delete(`/api/drivers/${id}`);
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } catch (error) {
        toast.error('Failed to delete driver');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      AVAILABLE: 'status-available',
      BUSY: 'status-busy',
      OFFLINE: 'status-offline',
      BREAK: 'status-maintenance'
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : 'No vehicle assigned';
  };

  if (loading) {
    return <div>Loading drivers...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Driver Management</h2>
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingDriver(null);
            setFormData({
              email: '',
              firstName: '',
              lastName: '',
              phoneNumber: '',
              licenseNumber: '',
              vehicleId: ''
            });
          }}
        >
          Add New Driver
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Number:</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assigned Vehicle:</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="">No vehicle assigned</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success" style={{ marginRight: '10px' }}>
                {editingDriver ? 'Update' : 'Create'}
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
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>License</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vehicle</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{driver.firstName} {driver.lastName}</td>
                <td style={{ padding: '10px' }}>{driver.email}</td>
                <td style={{ padding: '10px' }}>{driver.phoneNumber}</td>
                <td style={{ padding: '10px' }}>{driver.licenseNumber}</td>
                <td style={{ padding: '10px' }}>{getVehicleInfo(driver.vehicleId)}</td>
                <td style={{ padding: '10px' }}>{getStatusBadge(driver.status)}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    className="btn" 
                    style={{ marginRight: '5px', padding: '5px 10px' }}
                    onClick={() => handleEdit(driver)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '5px 10px' }}
                    onClick={() => handleDelete(driver.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverManagement;
