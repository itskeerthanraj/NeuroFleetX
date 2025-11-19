import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import DriverMap from './DriverMap';
import TripStatus from './TripStatus';
import VehicleTelemetry from './VehicleTelemetry';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('trips');
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchDriverData();
      const interval = setInterval(fetchDriverData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user?.email]);

  const fetchDriverData = async () => {
    try {
      setError(null);
      
      // Get all drivers and find one matching current user email
      const driversResponse = await axios.get('/api/drivers');
      const drivers = driversResponse.data;
      
      let currentDriver = drivers.find(d => d.email === user?.email);
      
      // If driver doesn't exist, create one
      if (!currentDriver) {
        currentDriver = await createDriver();
      }
      
      setDriver(currentDriver);
      
      // If driver has a vehicle assigned, fetch it
      if (currentDriver?.vehicleId) {
        try {
          const vehicleRes = await axios.get(`/api/vehicles/${currentDriver.vehicleId}`);
          setVehicle(vehicleRes.data);
        } catch (error) {
          console.warn('Vehicle not found:', error);
          setVehicle(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch driver data:', error);
      setError('Failed to load driver data. Please try again.');
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async () => {
    try {
      const newDriver = {
        email: user?.email,
        firstName: user?.firstName || 'Unknown',
        lastName: user?.lastName || 'Driver',
        phoneNumber: '',
        licenseNumber: '',
        status: 'AVAILABLE',
        currentLocation: { latitude: 0, longitude: 0, address: 'Unknown' }
      };
      
      const response = await axios.post('/api/drivers', newDriver);
      toast.success('Driver profile created successfully');
      return response.data;
    } catch (error) {
      console.error('Failed to create driver:', error);
      throw error;
    }
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      if (driver?.id) {
        await axios.put(`/api/drivers/${driver.id}/location`, null, {
          params: { latitude, longitude }
        });
      }
      
      if (vehicle?.id) {
        await axios.put(`/api/vehicles/${vehicle.id}/location`, null, {
          params: { latitude, longitude }
        });
      }
      
      toast.success('Location updated');
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location');
    }
  };

  const tabs = [
    { id: 'trips', label: '📍 Trip Status', component: TripStatus },
    { id: 'map', label: '🗺️ Navigation Map', component: DriverMap },
    { id: 'telemetry', label: '📊 Vehicle Telemetry', component: VehicleTelemetry }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>Loading driver dashboard...</div>
          <div style={{ width: '40px', height: '40px', border: '4px solid white', borderTop: '4px solid transparent', borderRadius: '50%', margin: 'auto', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .driver-dashboard-navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .navbar-brand {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid white;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      
      <nav className="driver-dashboard-navbar">
        <div className="navbar-brand">🚗 NeuroFleetX - Driver Dashboard</div>
        <div className="navbar-content" style={{ justifyContent: 'flex-end', gap: '20px' }}>
          <span>Welcome, <strong>{user?.firstName || 'Driver'}</strong></span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '30px', background: '#f8f9fa', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {error && (
            <div style={{
              background: '#fee',
              border: '2px solid #fcc',
              color: '#c33',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>⚠️ {error}</span>
              <button 
                onClick={() => setError(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Driver Status Card */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Driver Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>👤 Driver Status</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                  {driver?.status || 'AVAILABLE'}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>📧 Email</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#764ba2' }}>
                  {driver?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>📱 Phone</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  {driver?.phoneNumber || 'Not set'}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>🎫 License</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  {driver?.licenseNumber || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Assignment Card */}
          {vehicle ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Assigned Vehicle</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>🚗 Model</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>📋 License Plate</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#764ba2' }}>
                    {vehicle.licensePlate || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>📅 Year</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                    {vehicle.year || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>🟢 Status</p>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                    {vehicle.status || 'AVAILABLE'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              color: '#666'
            }}>
              <p style={{ fontSize: '16px' }}>🚗 No vehicle assigned yet</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #e0e0e0',
              background: '#f8f9fa',
              gap: '10px',
              padding: '10px'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#666',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div style={{ padding: '30px' }}>
              {ActiveComponent && driver && (
                <ActiveComponent 
                  driver={driver} 
                  vehicle={vehicle} 
                  updateLocation={updateLocation} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
