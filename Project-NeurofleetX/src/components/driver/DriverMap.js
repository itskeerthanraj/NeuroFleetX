import axios from 'axios';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import { toast } from 'react-toastify';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for markers
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-weight: bold;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const DriverMap = ({ driver, vehicle, updateLocation }) => {
  const [currentTrip, setCurrentTrip] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (driver?.id) {
      fetchCurrentTrip();
      getCurrentLocation();
      setIsTracking(true);
    }
  }, [driver?.id]);

  const fetchCurrentTrip = async () => {
    try {
      if (!driver?.id) return;
      
      const response = await axios.get(`/api/trips/driver/${driver.id}`);
      const tripsData = Array.isArray(response.data) ? response.data : [];
      const activeTrip = tripsData.find(trip => 
        trip.status === 'ASSIGNED' || trip.status === 'IN_PROGRESS'
      );
      setCurrentTrip(activeTrip);
    } catch (error) {
      console.warn('No active trips found:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by this browser';
      setLocationError(msg);
      toast.error(msg);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
        
        // Update location in backend
        if (updateLocation) {
          updateLocation(latitude, longitude);
        }
        
        toast.success('Location updated successfully');
      },
      (error) => {
        let errorMsg = 'Failed to get location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        setLocationError(errorMsg);
        console.error('Error getting location:', error);
        toast.error(errorMsg);
      }
    );
  };

  const updateLocationPeriodically = () => {
    if (!navigator.geolocation || !isTracking) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationError(null);
        
        if (updateLocation) {
          updateLocation(latitude, longitude);
        }
      },
      (error) => {
        console.warn('Error updating location:', error);
      }
    );
  };

  // Update location every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateLocationPeriodically, 30000);
    return () => clearInterval(interval);
  }, [isTracking]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '15px' }}>🗺️ Loading navigation map...</div>
          <div style={{ width: '40px', height: '40px', border: '3px solid #667eea', borderTop: '3px solid transparent', borderRadius: '50%', margin: 'auto', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const mapCenter = userLocation || [40.7128, -74.0060]; // Default to NYC

  // Calculate route points for polyline
  const routePoints = [];
  if (userLocation) routePoints.push(userLocation);
  if (currentTrip?.pickupLocation) {
    routePoints.push([currentTrip.pickupLocation.latitude, currentTrip.pickupLocation.longitude]);
  }
  if (currentTrip?.dropoffLocation) {
    routePoints.push([currentTrip.dropoffLocation.latitude, currentTrip.dropoffLocation.longitude]);
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>🗺️ Real-time Navigation Map</h2>
        
        {/* Trip Information */}
        {currentTrip ? (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            padding: '15px',
            color: 'white',
            marginBottom: '15px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>📍 Current Trip</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>ID</p>
                <p style={{ fontWeight: 'bold', margin: 0 }}>#{currentTrip.id.substring(0, 8)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>Status</p>
                <p style={{ fontWeight: 'bold', margin: 0 }}>
                  {currentTrip.status === 'IN_PROGRESS' ? '🚗 In Progress' : '✅ Assigned'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>Fare</p>
                <p style={{ fontWeight: 'bold', margin: 0 }}>${currentTrip.fare || '0.00'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>Pickup</p>
                <p style={{ fontSize: '12px', margin: 0 }}>{currentTrip.pickupLocation?.address || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>Dropoff</p>
                <p style={{ fontSize: '12px', margin: 0 }}>{currentTrip.dropoffLocation?.address || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px' }}>Notes</p>
                <p style={{ fontSize: '12px', margin: 0 }}>{currentTrip.notes || 'None'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#f0f4ff',
            border: '2px dashed #667eea',
            borderRadius: '8px',
            padding: '12px 15px',
            textAlign: 'center',
            color: '#666',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            <p style={{ margin: 0 }}>📭 No active trip. Waiting for requests...</p>
          </div>
        )}

        {/* Location Error */}
        {locationError && (
          <div style={{
            background: '#fee',
            border: '2px solid #fcc',
            borderRadius: '8px',
            padding: '12px 15px',
            color: '#c33',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            ⚠️ {locationError}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ height: '600px', width: '100%', position: 'relative' }}>
          {userLocation ? (
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Route Line */}
              {routePoints.length > 1 && (
                <Polyline
                  positions={routePoints}
                  color="#667eea"
                  weight={3}
                  opacity={0.7}
                  dashArray="5, 5"
                />
              )}
              
              {/* Current Location Marker */}
              <Marker position={userLocation} icon={createCustomIcon('#007bff', '📍')}>
                <Popup>
                  <div style={{ fontSize: '14px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>📍 Your Location</h4>
                    <p style={{ margin: '3px 0' }}>Lat: {userLocation[0].toFixed(6)}</p>
                    <p style={{ margin: '3px 0' }}>Lng: {userLocation[1].toFixed(6)}</p>
                    <button 
                      onClick={getCurrentLocation}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      🔄 Update Now
                    </button>
                  </div>
                </Popup>
              </Marker>

              {/* Trip Pickup Location */}
              {currentTrip && currentTrip.pickupLocation && (
                <Marker 
                  position={[currentTrip.pickupLocation.latitude, currentTrip.pickupLocation.longitude]}
                  icon={createCustomIcon('#28a745', '📍')}
                >
                  <Popup>
                    <div style={{ fontSize: '14px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#28a745', fontWeight: 'bold' }}>📍 Pickup Location</h4>
                      <p style={{ margin: '3px 0' }}>{currentTrip.pickupLocation.address || 'Pickup Point'}</p>
                      <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>
                        Lat: {currentTrip.pickupLocation.latitude.toFixed(6)}
                      </p>
                      <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>
                        Lng: {currentTrip.pickupLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Trip Dropoff Location */}
              {currentTrip && currentTrip.dropoffLocation && (
                <Marker 
                  position={[currentTrip.dropoffLocation.latitude, currentTrip.dropoffLocation.longitude]}
                  icon={createCustomIcon('#dc3545', '📍')}
                >
                  <Popup>
                    <div style={{ fontSize: '14px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#dc3545', fontWeight: 'bold' }}>📍 Dropoff Location</h4>
                      <p style={{ margin: '3px 0' }}>{currentTrip.dropoffLocation.address || 'Dropoff Point'}</p>
                      <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>
                        Lat: {currentTrip.dropoffLocation.latitude.toFixed(6)}
                      </p>
                      <p style={{ margin: '3px 0', fontSize: '12px', color: '#666' }}>
                        Lng: {currentTrip.dropoffLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              background: '#f8f9fa',
              color: '#666',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{ fontSize: '24px' }}>📍</div>
              <p>Unable to load map. Please enable location access.</p>
              <button
                onClick={getCurrentLocation}
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
                🔄 Enable Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Controls and Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '15px'
      }}>
        {/* Location Controls Card */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '13px' }}>🎯 Location</h4>
          <button 
            onClick={getCurrentLocation}
            style={{
              width: '100%',
              padding: '8px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#764ba2'}
            onMouseLeave={(e) => e.target.style.background = '#667eea'}
          >
            🔄 Update Now
          </button>
          <p style={{ fontSize: '11px', color: '#666', margin: '6px 0 0 0' }}>
            Auto-updates every 30s
          </p>
        </div>

        {/* Tracking Status Card */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '13px' }}>📡 Tracking</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: userLocation ? '#28a745' : '#dc3545',
              borderRadius: '50%',
              animation: userLocation ? 'pulse 2s infinite' : 'none'
            }}>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}</style>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
              {userLocation ? '✓ Active' : '✗ Inactive'}
            </span>
          </div>
        </div>

        {/* Trip Status Card */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '13px' }}>🚗 Trip</h4>
          <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: currentTrip ? '#28a745' : '#999' }}>
            {currentTrip ? '✓ Active Trip' : '⊘ No Trip'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#333', fontSize: '14px' }}>🗝️ Map Legend</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#007bff',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>📍</div>
            <span style={{ fontSize: '12px', color: '#333' }}>Your Location</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>📍</div>
            <span style={{ fontSize: '12px', color: '#333' }}>Pickup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}>📍</div>
            <span style={{ fontSize: '12px', color: '#333' }}>Dropoff</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '3px',
              backgroundColor: '#667eea',
              borderRadius: '2px',
              backgroundImage: 'repeating-linear-gradient(90deg, #667eea 0px, #667eea 5px, transparent 5px, transparent 10px)'
            }}></div>
            <span style={{ fontSize: '12px', color: '#333' }}>Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMap;