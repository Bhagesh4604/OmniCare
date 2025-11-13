import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiUrl from '@/config/api';
import useWebSocket from '../hooks/useWebSocket';
import MapView from '../components/ems/MapView';
import { Sparkles, HeartPulse, Gauge, Siren, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Functions & Components ---

const getAcuityInfo = (acuityText) => {
  if (!acuityText) return { level: 'N/A', color: 'bg-gray-500', textColor: 'text-white' };
  const text = acuityText.toLowerCase();
  if (text.includes('critical')) return { level: 'Critical', color: 'bg-black', textColor: 'text-red-400' };
  if (text.includes('high')) return { level: 'High', color: 'bg-red-500', textColor: 'text-white' };
  if (text.includes('moderate')) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-black' };
  if (text.includes('low')) return { level: 'Low', color: 'bg-green-500', textColor: 'text-white' };
  return { level: 'N/A', color: 'bg-gray-500', textColor: 'text-white' };
};

const TripCard = ({ trip, acuity, isGeneratingAcuity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const acuityInfo = useMemo(() => getAcuityInfo(acuity), [acuity]);

  const VitalStat = ({ icon, value, unit, label }) => (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="font-semibold">{value || 'N/A'}</span>
      <span className="text-gray-400">{unit}</span>
      <span className="text-gray-500">({label})</span>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* ETA */}
        <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-3 w-24">
          <span className="text-3xl font-bold text-blue-500 dark:text-blue-400">{trip.eta_minutes ?? '--'}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">MIN ETA</span>
        </div>

        {/* Trip Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{trip.vehicle_name}</h3>
            <span className="text-xs text-gray-500">({trip.trip_id})</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Patient: {trip.patient_name || (trip.patient_firstName ? `${trip.patient_firstName} ${trip.patient_lastName}` : 'Unknown')}
          </p>
        </div>

        {/* Acuity & Expander */}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${acuityInfo.color} ${acuityInfo.textColor}`}>
            {acuityInfo.level}
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vitals Section */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Latest Vitals</h4>
                {trip.latest_vitals ? (
                  <>
                    <VitalStat icon={<HeartPulse className="w-5 h-5 text-pink-500" />} value={trip.latest_vitals.heart_rate} unit="bpm" label="Heart Rate" />
                    <VitalStat icon={<Gauge className="w-5 h-5 text-teal-500" />} value={`${trip.latest_vitals.blood_pressure_systolic}/${trip.latest_vitals.blood_pressure_diastolic}`} unit="mmHg" label="Blood Pressure" />
                    <p className="text-sm text-gray-500 pt-2"><strong>Notes:</strong> {trip.latest_vitals.notes || 'None'}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No vitals received yet.</p>
                )}
              </div>

              {/* AI Assessment Section */}
              <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-900/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-800 dark:text-purple-300">
                  <Sparkles size={18} /> AI Acuity Assessment
                </h4>
                {isGeneratingAcuity && <p className="text-sm animate-pulse">Generating assessment...</p>}
                {acuity && (
                  <div className="text-sm whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300">
                    {acuity}
                  </div>
                )}
                {!isGeneratingAcuity && !acuity && <p className="text-sm text-gray-500">Waiting for vitals to generate assessment.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// Define a hardcoded location for the hospital
const HOSPITAL_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Example: Bangalore

const ERDashboard = () => {
  const navigate = useNavigate();
  const [transportingTrips, setTransportingTrips] = useState([]);
  const [ambulanceLocations, setAmbulanceLocations] = useState({});
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [errorTrips, setErrorTrips] = useState('');
  const [tripAcuity, setTripAcuity] = useState({});
  const [generatingAcuity, setGeneratingAcuity] = useState({});

  const generateAcuityAssessment = async (trip) => {
    if (!trip.latest_vitals || generatingAcuity[trip.trip_id] || tripAcuity[trip.trip_id]) {
      return; // Don't generate if no vitals, already generating, or already have one
    }

    setGeneratingAcuity(prev => ({ ...prev, [trip.trip_id]: true }));

    const { heart_rate, blood_pressure_systolic, blood_pressure_diastolic, notes } = trip.latest_vitals;
    const systemPrompt = "You are an expert ER triage AI. Your role is to provide a brief, clear pre-arrival acuity assessment based on paramedic field data. Use professional medical terminology. Be concise. Structure your response with 'Assessment:', 'Acuity:', and 'Suggested Prep:'. Acuity should be one of: Low, Moderate, High, Critical.";
    const userQuery = `
      Incoming patient.
      Vitals:
      - Heart Rate: ${heart_rate || 'N/A'} bpm
      - Blood Pressure: ${blood_pressure_systolic || 'N/A'} / ${blood_pressure_diastolic || 'N/A'} mmHg
      Paramedic Notes: "${notes || 'No notes provided.'}"

      Provide a pre-arrival acuity assessment.
    `;

    try {
      const response = await fetch(apiUrl('/api/ai/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery }
          ]
        }),
      });
      if (!response.ok) throw new Error('AI service request failed');
      const result = await response.json();
      setTripAcuity(prev => ({ ...prev, [trip.trip_id]: result.reply || "Could not generate assessment." }));
    } catch (error) {
      console.error("AI Acuity Assessment error:", error);
      setTripAcuity(prev => ({ ...prev, [trip.trip_id]: "Error generating assessment." }));
    } finally {
      setGeneratingAcuity(prev => ({ ...prev, [trip.trip_id]: false }));
    }
  };

  const fetchTransportingTrips = async () => {
    setLoadingTrips(true);
    setErrorTrips('');
    try {
      const response = await fetch(apiUrl('/api/ems/trips/transporting'));
      const data = await response.json();
      if (data.success) {
        setTransportingTrips(data.trips);
        const newLocations = {};
        data.trips.forEach(trip => {
          if (trip.last_latitude && trip.last_longitude) {
            newLocations[trip.assigned_ambulance_id] = {
              lat: trip.last_latitude,
              lng: trip.last_longitude,
              timestamp: new Date().toISOString(),
              vehicle_name: trip.vehicle_name,
            };
          }
          generateAcuityAssessment(trip); // Generate assessment on initial load
        });
        setAmbulanceLocations(newLocations);
      } else {
        setErrorTrips(data.message || 'Failed to fetch transporting trips.');
      }
    } catch (error) {
      console.error('Error fetching transporting trips:', error);
      setErrorTrips('Failed to connect to the server to fetch transporting trips.');
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleWebSocketMessage = useCallback((message) => {
    console.log('ER Dashboard received WebSocket message:', message);
    const { type, payload } = message;

    switch (type) {
      case 'NEW_VITALS':
        const updatedTripWithVitals = transportingTrips.find(t => t.trip_id === payload.trip_id);
        if (updatedTripWithVitals) {
          const newTripState = { ...updatedTripWithVitals, latest_vitals: payload };
          setTransportingTrips(prevTrips =>
            prevTrips.map(trip =>
              trip.trip_id === payload.trip_id ? newTripState : trip
            )
          );
          generateAcuityAssessment(newTripState); // Generate assessment when new vitals arrive
        }
        break;
      case 'TRIP_ETA_UPDATE':
        setTransportingTrips(prevTrips =>
          prevTrips.map(trip =>
            trip.trip_id === payload.trip_id
              ? { ...trip, eta_minutes: payload.eta_minutes }
              : trip
          )
        );
        break;
      case 'TRIP_STATUS_UPDATE':
        const { trip, lastLocation } = payload;
        if (trip.status === 'Transporting') {
          setTransportingTrips(prevTrips => {
            if (prevTrips.some(t => t.trip_id === trip.trip_id)) {
              return prevTrips.map(t => t.trip_id === trip.trip_id ? trip : t);
            }
            return [...prevTrips, trip];
          });
          if (lastLocation) {
            setAmbulanceLocations(prevLocations => ({
              ...prevLocations,
              [trip.assigned_ambulance_id]: {
                lat: lastLocation.latitude,
                lng: lastLocation.longitude,
                timestamp: new Date().toISOString(),
                vehicle_name: trip.vehicle_name,
              },
            }));
          }
          generateAcuityAssessment(trip); // Generate assessment for new transporting trip
        } else {
          setTransportingTrips(prevTrips =>
            prevTrips.filter(t => t.trip_id !== trip.trip_id)
          );
        }
        break;
      case 'AMBULANCE_LOCATION_UPDATE':
        setAmbulanceLocations(prevLocations => ({
          ...prevLocations,
          [payload.ambulance_id]: {
            ...prevLocations[payload.ambulance_id],
            lat: payload.latitude,
            lng: payload.longitude,
            timestamp: payload.timestamp,
          },
        }));
        break;
      default:
        break;
    }
  }, [transportingTrips, generatingAcuity, tripAcuity]);

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    fetchTransportingTrips();
  }, []);

  const hospitalDestinations = transportingTrips.reduce((acc, trip) => {
    if (trip.assigned_ambulance_id) {
      acc[trip.assigned_ambulance_id] = HOSPITAL_LOCATION;
    }
    return acc;
  }, {});

  const sortedTrips = useMemo(() => {
    return [...transportingTrips].sort((a, b) => {
      const etaA = a.eta_minutes ?? Infinity;
      const etaB = b.eta_minutes ?? Infinity;
      return etaA - etaB;
    });
  }, [transportingTrips]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">ER Pre-Arrival Dashboard</h1>
      </div>

      <div className="w-full h-64 sm:h-80 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <MapView ambulanceLocations={ambulanceLocations} destinations={hospitalDestinations} />
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {loadingTrips ? (
          <div className="text-center text-lg">Loading incoming trips...</div>
        ) : errorTrips ? (
          <div className="text-center text-lg text-red-500">Error: {errorTrips}</div>
        ) : sortedTrips.length > 0 ? (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {sortedTrips.map(trip => (
                <TripCard 
                  key={trip.trip_id} 
                  trip={trip} 
                  acuity={tripAcuity[trip.trip_id]}
                  isGeneratingAcuity={generatingAcuity[trip.trip_id]}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center text-lg text-gray-600 dark:text-gray-400 mt-16">
            <Siren className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">No Incoming Patients</h3>
            <p className="mt-1 text-sm">The dashboard is clear. Waiting for new transporting trips.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERDashboard;
