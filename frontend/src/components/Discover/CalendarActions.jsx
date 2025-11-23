import React, { useState } from 'react'
import '../../styles/Discover.css'

export function CalendarActions({ event }) {
  const [open, setOpen] = useState(false)
  if (!event) return null

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001'
  const icsUrl = `${baseUrl}/api/events/${event.id}/ics`
  const webcalUrl = icsUrl.replace(/^https?:/, 'webcal:')

  // Format for Google Calendar
  const formatGoogleDate = date => {
    return new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '')
  }

  const start = formatGoogleDate(event.date)
  const end = formatGoogleDate(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000)) // 2 hour default

  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Event',
    details: event.description || '',
    location: event.locationName || '',
    dates: `${start}/${end}`,
  })

  const googleUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`

   return (
    <div className="calendar-actions">
      <div className="dropdown">
        <button
          className="calendar-btn"
          onClick={e => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          Add to Calendar ▾
        </button>

        {open && (
          <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
            <div
              className="dropdown-item"
              onClick={() => window.open(icsUrl, '_blank')}
            >
              Download .ics
            </div>

            <div
              className="dropdown-item"
              onClick={() => window.open(googleUrl, '_blank')}
            >
              Google Calendar
            </div>

            <div
              className="dropdown-item"
              onClick={() => window.open(webcalUrl, '_blank')}
            >
              Apple Calendar
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
