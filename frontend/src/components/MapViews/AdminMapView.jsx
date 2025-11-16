import React, { useState, useEffect } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'

const containerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '12px',
}

const center = { lat: 45.5017, lng: -73.5673 }
const AdminMapView = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [stats, setStats] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/getEvents')
        const data = await res.json()
        const available = data.events.filter(e => {
          const tickets = e._count?.tickets ?? 0
          return e.maxAttendees == null || tickets < e.maxAttendees
        })
        setEvents(available)
        console.log('Filtered events:', available)
      } catch (err) {
        console.error('Error fetching events:', err)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/admin/region-stats')
        const data = await res.json()
        setStats(data.stats || [])
        console.log('Region stats:', data.stats)
      } catch (err) {
        console.error('Error fetching region stats:', err)
      }
    }
    fetchStats()
  }, [])

  if (!isLoaded) return <p>Loading map...</p>

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ flex: 1 }}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
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
                <h3 style={{ marginBottom: '6px', fontWeight: '600' }}>{selectedEvent.title}</h3>
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
      </div>

      {/* SIDE ANALYTICS PANEL */}
      <div
        style={{
          width: '280px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '16px',
          marginRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          overflowY: 'auto',
          height: '80vh',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Events by Region
        </h2>

        {stats.length > 0 ? (
          stats.map((region, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.05)',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontWeight: '500', color: '#333' }}>{region.region}</span>
              <span
                style={{
                  fontWeight: '600',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '4px 8px',
                }}
              >
                {region.count}
              </span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>No data available</p>
        )}
      </div>
    </div>
  )
}

export default AdminMapView
