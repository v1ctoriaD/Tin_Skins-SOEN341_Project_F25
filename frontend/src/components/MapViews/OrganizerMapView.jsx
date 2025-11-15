import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'

const containerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '12px',
}

const center = { lat: 45.5017, lng: -73.5673 }

const OrganizerMapView = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const navigate = useNavigate()

  // Fetch events owned by the logged-in org
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const org = JSON.parse(localStorage.getItem('org'))
        if (!org?.id) {
          console.error('No organization found in localStorage')
          return
        }
        const res = await fetch(`http://localhost:5001/api/getEventsOwned/${org.id}`)
        const data = await res.json()

        if (data.events && data.events.length > 0) {
          setEvents(data.events)
        } else {
          console.warn('No events found for this organization')
        }
      } catch (err) {
        console.error('Error fetching organization events:', err)
      }
    }

    fetchEvents()
  }, [])

  if (!isLoaded) return <p>Loading map...</p>

  const handleMapClick = e => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      let address = ''
      if (status === 'OK' && results && results[0]) {
        address = results[0].formatted_address
      }

      const params = new URLSearchParams()
      params.set('lat', lat)
      params.set('lng', lng)
      if (address) params.set('address', address)

      navigate(`/create?${params.toString()}`)
    })
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onClick={handleMapClick}
    >
      {events.length > 0 ? (
        events.map((event, i) => (
          <Marker
            key={i}
            position={{
              lat: Number(event.latitude || event.lat || 45.5017),
              lng: Number(event.longitude || event.lng || -73.5673),
            }}
            onClick={() => setSelectedEvent(event)}
          />
        ))
      ) : (
        <p
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          No events found for your organization
        </p>
      )}

      {selectedEvent && (
        <InfoWindow
          position={{
            lat: selectedEvent.latitude ?? 45.5017,
            lng: selectedEvent.longitude ?? -73.5673,
          }}
          onCloseClick={() => setSelectedEvent(null)}
        >
          <div style={{ maxWidth: '220px' }}>
            <h3 style={{ marginBottom: '6px', fontWeight: '600' }}>{selectedEvent.title}</h3>
            <p style={{ fontSize: '14px', color: '#555' }}>
              {selectedEvent.description?.slice(0, 80)}...
            </p>
            <button
              onClick={() => navigate(`/myEvents/${selectedEvent.id}`)}
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}

export default OrganizerMapView
