import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import '../../styles/tokens.css'
import '../../styles/qr.css'
import usePageTitle from '../../hooks/usePageTitle'

export default function TicketClaim({ setEvents, user = null, setUser }) {
  usePageTitle()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedEvent } = location.state || {}
  const [ticketId, setTicketId] = useState(null)
  const [token, setToken] = useState('')
  const [result, setResult] = useState('')

  //protect route
  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    if (!selectedEvent) {
      navigate('/discover')
    }
  }, [user, selectedEvent, navigate])

  const [errors, setErrors] = useState([])

  const generateQr = async id => {
    setResult('...')
    const ticketIdToUse = id || ticketId
    try {
      const res = await fetch(`/api/tickets/${ticketIdToUse}/qr`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setToken(data.payload.t)
        setResult('QR generated successfully')
        return data.payload.t
      } else {
        setResult(`${data.reason || 'Failed to generate QR'}`)
        return ''
      }
    } catch {
      setResult('Server error while generating QR')
      return ''
    }
  }

  const qrValue = token ? JSON.stringify({ t: token }) : ''

  async function onPay() {
    try {
      // after mock payment, call backend
      const newTicket = await submitToBackend()
      setTicketId(newTicket.id)
      const newToken = await generateQr(newTicket.id)
      newTicket.qrToken = newToken
      // Update user locally:
      setUser(prev => ({
        ...prev,
        tickets: [...(prev.tickets || []), newTicket],
        eventsRegistered: [...(prev.eventsRegistered || []), selectedEvent],
      }))
      // Update event locally:
      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              eventAttendees: [...(event.eventAttendees || []), user],
              tickets: [...(event.tickets || []), newTicket],
            }
          }
          return event
        }),
      )
    } catch (err) {
      setErrors([err?.message || 'Payment failed'])
    }
  }

  async function submitToBackend() {
    try {
      // include buyerAuthId when session is present (supabase user id) to let backend resolve the DB
      const payload = { userId: user.id }
      // include token if available for server-side verification (optional)
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`/api/events/${selectedEvent.id}/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors([data.error || 'Failed to create ticket'])
        return
      }
      return data.ticket
    } catch (err) {
      setErrors([err.message || 'Network error'])
    }
  }

  return (
    <main className="qr-page">
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Title ABOVE the box */}
        <h2 className="qr-page-title">
          {!token ? (
            <>
              Register to <u>{selectedEvent.title}</u>
            </>
          ) : (
            'Ticket claimed'
          )}
        </h2>

        <section className="qr-card">
          {!token && (
            <p className="qr-page-subtitle">
              You're about to pay for a ticket for: <b>{selectedEvent.title}</b>
            </p>
          )}
          {!token && <p className="qr-page-subtitle">Cost: {selectedEvent.cost}$</p>}
          {token && (
            <p>
              Thanks <strong>{user.firstName}</strong>! Your ticket for{' '}
              <strong>{selectedEvent.title}</strong> is reserved.
            </p>
          )}
          {errors.length > 0 && (
            <div style={{ color: '#a33', marginBottom: 12 }}>
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          {!token && (
            <div className="qr-actions">
              <button className="qr-btn" onClick={onPay}>
                Pay
              </button>
            </div>
          )}

          {token && (
            <>
              <div className="qr-decoded">
                <strong>Token:</strong> {token}
              </div>
              <div className="qr-preview">
                <QRCode value={qrValue} size={220} />
              </div>
            </>
          )}

          <div className="qr-status">{result}</div>

          {token && (
            <div className="qr-actions">
              <button className="qr-btn" onClick={() => navigate('/registrations')}>
                See Registrations
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
