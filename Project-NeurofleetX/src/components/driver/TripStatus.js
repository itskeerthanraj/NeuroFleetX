import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const TripStatus = ({ driver, vehicle }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(null);

  useEffect(() => {
    if (driver?.id) {
      fetchTrips();
      const interval = setInterval(fetchTrips, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [driver?.id]);

  const fetchTrips = async () => {
    try {
      if (!driver?.id) return;
      
      const response = await axios.get(`/api/trips/driver/${driver.id}`);
      const tripsData = Array.isArray(response.data) ? response.data : [];
      setTrips(tripsData);
      
      // Find current active trip
      const activeTrip = tripsData.find(trip => 
        trip.status === 'ASSIGNED' || trip.status === 'IN_PROGRESS'
      );
      setCurrentTrip(activeTrip);
    } catch (error) {
      console.error('Error fetching trips:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch trips');
      }
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async (tripId) => {
    try {
      await axios.put(`/api/trips/${tripId}/start`);
      toast.success('Trip started successfully');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to start trip');
    }
  };

  const completeTrip = async (tripId) => {
    try {
      await axios.put(`/api/trips/${tripId}/complete`);
      toast.success('Trip completed successfully');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to complete trip');
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

  const getStatusActions = (trip) => {
    switch (trip.status) {
      case 'ASSIGNED':
        return (
          <button 
            className="btn btn-success" 
            onClick={() => startTrip(trip.id)}
          >
            Start Trip
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button 
            className="btn btn-warning" 
            onClick={() => completeTrip(trip.id)}
          >
            Complete Trip
          </button>
        );
      default:
        return <span style={{ color: '#6c757d' }}>No actions available</span>;
    }
  };

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div>
      <h2>Trip Status</h2>
      
      {/* Current Trip Card */}
      {currentTrip && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#f8f9fa' }}>
          <h3>Current Trip</h3>
          <div className="grid grid-2">
            <div>
              <p><strong>Trip ID:</strong> #{currentTrip.id.substring(0, 8)}</p>
              <p><strong>Status:</strong> {getStatusBadge(currentTrip.status)}</p>
              <p><strong>Fare:</strong> ${currentTrip.fare || '0.00'}</p>
            </div>
            <div>
              <p><strong>Pickup:</strong> {currentTrip.pickupLocation?.address || 'N/A'}</p>
              <p><strong>Dropoff:</strong> {currentTrip.dropoffLocation?.address || 'N/A'}</p>
              <p><strong>Notes:</strong> {currentTrip.notes || 'None'}</p>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            {getStatusActions(currentTrip)}
          </div>
        </div>
      )}

      {/* Trip History */}
      <div className="card">
        <h3>Trip History</h3>
        {trips.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
            No trips found
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Trip ID</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Pickup</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Dropoff</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Fare</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Start Time</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>End Time</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>#{trip.id.substring(0, 8)}</td>
                  <td style={{ padding: '10px' }}>{trip.pickupLocation?.address || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>{trip.dropoffLocation?.address || 'N/A'}</td>
                  <td style={{ padding: '10px' }}>${trip.fare || '0.00'}</td>
                  <td style={{ padding: '10px' }}>{getStatusBadge(trip.status)}</td>
                  <td style={{ padding: '10px' }}>
                    {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {trip.endTime ? new Date(trip.endTime).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {getStatusActions(trip)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TripStatus;