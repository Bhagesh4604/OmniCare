import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../../hooks/useGeolocation';
import apiUrl from '../../config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, MapPin, Edit, ArrowLeft } from 'lucide-react';
import ParamedicMapView from '../../components/ems/ParamedicMapView';

const BookAmbulance = ({ user }) => {
  const navigate = useNavigate();
  const { position, error: geoError, startTracking } = useGeolocation();
  const [notes, setNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, locating, manual, booking, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [tripId, setTripId] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [availableAmbulances, setAvailableAmbulances] = useState([]);

  useEffect(() => {
    const checkActiveTrip = async () => {
      if (!user || !user.id) return;
      try {
        const response = await fetch(apiUrl(`/api/ems/patient/my-trip-status?patientId=${user.id}`));
        const data = await response.json();
        if (data.success && data.trip) {
          navigate(`/patient/track-ambulance/${data.trip.trip_id}`);
        } else {
          fetchAvailableAmbulances();
        }
      } catch (error) {
        console.error("Error checking for active trip:", error);
        fetchAvailableAmbulances();
      }
    };
    checkActiveTrip();
  }, [user, navigate]);

  const fetchAvailableAmbulances = async () => {
    try {
      const response = await fetch(apiUrl('/api/ems/ambulances/locations'));
      const data = await response.json();
      if (data.success) {
        setAvailableAmbulances(data.locations);
      }
    } catch (error) {
      console.error("Error fetching available ambulances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    setBookingStatus('locating');
    startTracking();
  };

  const handleBookNow = async () => {
    let lat, lon;

    if (bookingStatus === 'locating' && position) {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    } else if (bookingStatus === 'manual' && manualAddress) {
      setBookingStatus('booking');
      setErrorMessage('');
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          lat = data[0].lat;
          lon = data[0].lon;
        } else {
          setBookingStatus('error');
          setErrorMessage('Could not find the specified address. Please try again.');
          return;
        }
      } catch (error) {
        setBookingStatus('error');
        setErrorMessage('Failed to geocode the address.');
        return;
      }
    } else {
      setErrorMessage('Please provide a location or address.');
      return;
    }

    setBookingStatus('booking');
    setErrorMessage('');
    try {
      const response = await fetch(apiUrl('/api/ems/patient/book-ambulance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: user.id,
          latitude: lat,
          longitude: lon,
          notes: notes,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setBookingStatus('success');
        setTripId(data.trip_id);
        setTimeout(() => {
          navigate(`/patient/track-ambulance/${data.trip_id}`);
        }, 2000);
      } else {
        setBookingStatus('error');
        setErrorMessage(data.message || 'Failed to book ambulance.');
      }
    } catch (error) {
      setBookingStatus('error');
      setErrorMessage('Failed to connect to the server.');
    }
  };

  const renderContent = () => {
    switch (bookingStatus) {
      case 'idle':
        return (
          <div className="space-y-4">
            <Button onClick={handleGetLocation} className="w-full" size="lg">
              <MapPin className="mr-2 h-4 w-4" /> Use My Current Location
            </Button>
            <Button onClick={() => setBookingStatus('manual')} className="w-full" size="lg" variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Enter Address Manually
            </Button>
          </div>
        );
      case 'locating':
        if (geoError) {
          return (
            <Alert variant="destructive">
              <AlertTitle>Geolocation Error</AlertTitle>
              <AlertDescription>{geoError}</AlertDescription>
            </Alert>
          );
        }
        if (position) {
          return renderBookingForm('Your current location will be used.');
        }
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2">Getting your location...</p>
          </div>
        );
      case 'manual':
        return renderBookingForm('Please enter the address for pickup.');
      case 'booking':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2">Finding the nearest ambulance...</p>
          </div>
        );
      case 'success':
        return (
          <Alert variant="success">
            <AlertTitle>Booking Successful!</AlertTitle>
            <AlertDescription>
              Help is on the way. Redirecting you to the tracking page...
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertTitle>Booking Failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderBookingForm = (locationMessage) => (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Location</AlertTitle>
        <AlertDescription>{locationMessage}</AlertDescription>
      </Alert>
      {bookingStatus === 'manual' && (
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Address
          </label>
          <Input
            id="address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="e.g., 123 Main St, Anytown, USA"
          />
        </div>
      )}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes for the Paramedic (Optional):
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Patient is on the 2nd floor, difficulty breathing."
        />
      </div>
      <Button onClick={handleBookNow} className="w-full" size="lg" disabled={bookingStatus === 'booking'}>
        Book Ambulance Now
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-2">Checking for active trips...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="w-full rounded-lg overflow-hidden shadow-md mb-4 h-[33vh]">
        <ParamedicMapView ambulances={availableAmbulances} />
      </div>
      <Card className="w-full max-w-full flex-shrink-0 flex-grow">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4"
            onClick={() => navigate('/patient-dashboard')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <CardTitle className="text-2xl font-bold text-center">Book an Ambulance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAmbulance;