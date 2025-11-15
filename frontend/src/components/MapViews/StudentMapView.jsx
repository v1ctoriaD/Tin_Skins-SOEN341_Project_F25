import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'

const containerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '12px',
}
}

const center = { lat: 45.5017, lng: -73.5673 }
const center = { lat: 45.5017, lng: -73.5673 }

const StudentMapView = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  })

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const navigate = useNavigate()

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/getEvents')
        const data = await res.json()
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/getEvents')
        const data = await res.json()

        const available = data.events.filter(e => {
          const tickets = e._count?.tickets ?? 0 // safely handle undefined
          return e.maxAttendees == null || tickets < e.maxAttendees
        })
        setEvents(available)

        console.log('Filtered events:', available)
        setEvents(available)
      } catch (err) {
        console.error('Error fetching events:', err)
      }
        const available = data.events.filter(e => {
          const tickets = e._count?.tickets ?? 0 // safely handle undefined
          return e.maxAttendees == null || tickets < e.maxAttendees
        })
        setEvents(available)

        console.log('Filtered events:', available)
        setEvents(available)
      } catch (err) {
        console.error('Error fetching events:', err)
      }
    }
    fetchEvents()
  }, [])
    fetchEvents()
  }, [])

  if (!isLoaded) return <p>Loading map...</p>
  if (!isLoaded) return <p>Loading map...</p>

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
      {events.map((event, i) => (
        <Marker
          key={i}
          position={{
            lat: Number(event.latitude || event.lat || 45.5017),
            lng: Number(event.longitude || event.lng),
          }}
          onClick={() => setSelectedEvent(event)}
        />
      ))}

      {selectedEvent && (
        <InfoWindow
          position={{
            lat: selectedEvent.latitude ?? 45.5017,
            lng: selectedEvent.longitude ?? -73.5673,
          }}
          onCloseClick={() => setSelectedEvent(null)}
        >
          <div style={{ maxWidth: '220px' }}>
            <h3 style={{ marginBottom: '6px' }}>{selectedEvent.title}</h3>
            <p style={{ fontSize: '14px', color: '#555' }}>
              {selectedEvent.description?.slice(0, 80)}...
            </p>
            <button
              onClick={() => navigate(`/discover/${selectedEvent.id}`)}
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
              View More
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}
  )
}

export default StudentMapView
export default StudentMapView
