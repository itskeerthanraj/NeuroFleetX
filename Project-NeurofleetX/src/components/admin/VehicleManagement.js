import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: '',
    color: '',
    type: 'SEDAN'
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await axios.put(`/api/vehicles/${editingVehicle.id}`, formData);
        toast.success('Vehicle updated successfully');
      } else {
        await axios.post('/api/vehicles', formData);
        toast.success('Vehicle created successfully');
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({
        licensePlate: '',
        make: '',
        model: '',
        year: '',
        color: '',
        type: 'SEDAN'
      });
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      type: vehicle.type
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await axios.delete(`/api/vehicles/${id}`);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      AVAILABLE: 'status-available',
      BUSY: 'status-busy',
      MAINTENANCE: 'status-maintenance',
      OFFLINE: 'status-offline'
    };
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Vehicle Management</h2>
        <button 
          className="btn btn-success" 
          onClick={() => {
            setShowForm(true);
            setEditingVehicle(null);
            setFormData({
              licensePlate: '',
              make: '',
              model: '',
              year: '',
              color: '',
              type: 'SEDAN'
            });
          }}
        >
          Add New Vehicle
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>License Plate:</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Make:</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Model:</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year:</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="VAN">Van</option>
                  <option value="TRUCK">Truck</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-success" style={{ marginRight: '10px' }}>
                {editingVehicle ? 'Update' : 'Create'}
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
              <th style={{ padding: '10px', textAlign: 'left' }}>License Plate</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Make/Model</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Year</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Color</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{vehicle.licensePlate}</td>
                <td style={{ padding: '10px' }}>{vehicle.make} {vehicle.model}</td>
                <td style={{ padding: '10px' }}>{vehicle.year}</td>
                <td style={{ padding: '10px' }}>{vehicle.color}</td>
                <td style={{ padding: '10px' }}>{vehicle.type}</td>
                <td style={{ padding: '10px' }}>{getStatusBadge(vehicle.status)}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    className="btn" 
                    style={{ marginRight: '5px', padding: '5px 10px' }}
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '5px 10px' }}
                    onClick={() => handleDelete(vehicle.id)}
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

export default VehicleManagement;
