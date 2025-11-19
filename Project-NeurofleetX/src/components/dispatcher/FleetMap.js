import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for fleet map
const createVehicleIcon = (status) => {
  const colors = {
    AVAILABLE: '#28a745',    // Green
    BUSY: '#dc3545',         // Red
    MAINTENANCE: '#ffc107',  // Orange
    OFFLINE: '#6c757d'       // Gray
  };
  const color = colors[status] || '#007bff';

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-weight: bold;
    ">🚗</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const createTripIcon = (status) => {
  const colors = {
    REQUESTED: '#ffc107',    // Yellow
    ASSIGNED: '#007bff',     // Blue
    IN_PROGRESS: '#28a745',  // Green
    COMPLETED: '#6c757d',    // Gray
    CANCELLED: '#dc3545'     // Red
  };
  const color = colors[status] || '#667eea';

  return L.divIcon({
    className: 'custom-trip-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const FleetMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([40.7128, -74.0060]); // Default to NYC

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      setError(null);
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        axios.get('/api/vehicles').catch(err => {
          console.warn('Vehicles fetch error:', err);
          return { data: [] };
        }),
        axios.get('/api/drivers').catch(err => {
          console.warn('Drivers fetch error:', err);
          return { data: [] };
        }),
        axios.get('/api/trips').catch(err => {
          console.warn('Trips fetch error:', err);
          return { data: [] };
        })
      ]);

      const vehiclesData = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : [];
      const driversData = Array.isArray(driversRes.data) ? driversRes.data : [];
      const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : [];

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setTrips(tripsData);

      // Set center to first vehicle with location, or keep default
      const vehicleWithLocation = vehiclesData.find(v => v.currentLocation?.latitude);
      if (vehicleWithLocation) {
        setCenter([vehicleWithLocation.currentLocation.latitude, vehicleWithLocation.currentLocation.longitude]);
      }
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      setError('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a readable driver name from driverId
  const getDriverName = (driverId) => {
    if (!driverId || !Array.isArray(drivers)) return 'Unknown';
    const d = drivers.find(drv => drv.id === driverId || drv._id === driverId || drv.driverId === driverId);
    if (!d) return 'Unknown';
    const name = d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.username || d.email;
    return name || 'Unknown';
  };

  if (error) {
    return (
      <div style={{
        background: '#fee',
        border: '2px solid #fcc',
        borderRadius: '8px',
        padding: '20px',
        color: '#c33',
        textAlign: 'center'
      }}>
        <p>⚠️ {error}</p>
        <button
          onClick={fetchFleetData}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '15px' }}>🗺️ Loading fleet map...</div>
          <div style={{ width: '40px', height: '40px', border: '3px solid #667eea', borderTop: '3px solid transparent', borderRadius: '50%', margin: 'auto', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const vehiclesWithLocation = vehicles.filter(v => v.currentLocation?.latitude && v.currentLocation?.longitude);
  const tripsWithPickup = trips.filter(t => t.pickupLocation?.latitude && t.pickupLocation?.longitude);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>🗺️ Real-time Fleet Map</h2>
      
      {/* Compact Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '6px',
        marginBottom: '8px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '6px',
          padding: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '9px', opacity: 0.9, marginBottom: '1px' }}>Vehicles</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{vehicles.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          borderRadius: '6px',
          padding: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '9px', opacity: 0.9, marginBottom: '1px' }}>Live</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{vehiclesWithLocation.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
          borderRadius: '6px',
          padding: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '9px', opacity: 0.9, marginBottom: '1px' }}>Trips</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{tripsWithPickup.length}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
          borderRadius: '6px',
          padding: '8px',
          color: 'white',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '9px', opacity: 0.9, marginBottom: '1px' }}>Available</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{drivers.filter(d => d.status === 'AVAILABLE').length}</p>
        </div>
      </div>

      {/* Map - Takes most of the space */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '8px',
        flex: 1,
        minHeight: 0
      }}>
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          {vehiclesWithLocation.length > 0 || tripsWithPickup.length > 0 ? (
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Vehicle Markers */}
              {vehiclesWithLocation.map(vehicle => (
                <Marker
                  key={`vehicle-${vehicle.id}`}
                  position={[vehicle.currentLocation.latitude, vehicle.currentLocation.longitude]}
                  icon={createVehicleIcon(vehicle.status)}
                >
                  <Popup>
                    <div style={{ fontSize: '13px', minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                        🚗 {vehicle.make} {vehicle.model}
                      </h4>
                      <p style={{ margin: '3px 0' }}><strong>License:</strong> {vehicle.licensePlate}</p>
                      <p style={{ margin: '3px 0' }}><strong>Status:</strong> {vehicle.status}</p>
                      <p style={{ margin: '3px 0' }}><strong>Type:</strong> {vehicle.type}</p>
                      {vehicle.driverId && (
                        <p style={{ margin: '3px 0' }}><strong>Driver:</strong> {getDriverName(vehicle.driverId)}</p>
                      )}
                      <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#666' }}>
                        Lat: {vehicle.currentLocation.latitude.toFixed(4)} | Lng: {vehicle.currentLocation.longitude.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Trip Markers */}
              {tripsWithPickup.map(trip => (
                <Marker
                  key={`trip-${trip.id}`}
                  position={[trip.pickupLocation.latitude, trip.pickupLocation.longitude]}
                  icon={createTripIcon(trip.status)}
                >
                  <Popup>
                    <div style={{ fontSize: '12px', minWidth: '220px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
                        📍 Trip #{trip.id.substring(0, 8)}
                      </h4>
                      <p style={{ margin: '3px 0' }}><strong>Status:</strong> {trip.status}</p>
                      <p style={{ margin: '3px 0' }}><strong>Pickup:</strong> {trip.pickupLocation.address || 'Unknown'}</p>
                      {trip.dropoffLocation && (
                        <p style={{ margin: '3px 0' }}><strong>Dropoff:</strong> {trip.dropoffLocation.address || 'Unknown'}</p>
                      )}
                      {trip.driverId && (
                        <p style={{ margin: '3px 0' }}><strong>Driver:</strong> {getDriverName(trip.driverId)}</p>
                      )}
                      {trip.fare && (
                        <p style={{ margin: '3px 0' }}><strong>Fare:</strong> ${trip.fare}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              background: '#f8f9fa',
              color: '#666',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>📭 No vehicles or trips to display</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Vehicles and trips will appear here when they have location data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Legend */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '9px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '6px', color: '#333', fontSize: '11px' }}>📋 Legend</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '9px', color: '#666', display: 'block', marginBottom: '3px' }}>VEHICLES:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '8px' }}>
              <div>🟢 Available</div>
              <div>🔴 Busy</div>
              <div>🟠 Maint.</div>
              <div>⚫ Offline</div>
            </div>
          </div>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '9px', color: '#666', display: 'block', marginBottom: '3px' }}>TRIPS:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '8px' }}>
              <div>🟡 Requested</div>
              <div>🔵 Assigned</div>
              <div>🟢 Progress</div>
              <div>❌ Cancelled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetMap;
