import { useEffect, useState, useMemo } from 'react'
import EventCard from './EventCard'
import '../../styles/Discover.css'
import '../../styles/qr.css'
import Filters from './Filters'
import usePageTitle from '../../hooks/usePageTitle'
import { useNavigate, useParams } from 'react-router-dom'
import QRCode from 'react-qr-code'

function Discover({ events, user, org, isRegistrations, isMyEvent, onDeleted }) {
  usePageTitle();
  const navigate = useNavigate();
  const notNullEvents = useMemo(() => events || [], [events]);
  const { id } = useParams();
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (isRegistrations && !user) {
      navigate('/')
      return
    }
    if (isMyEvent && !org) {
      navigate('/')
      return
    }
  }, [isRegistrations, user, navigate, isMyEvent, org])

  useEffect(() => {
    if (id && notNullEvents.length > 0) {
      const matched = notNullEvents.find(e => e.id === Number(id))
      if (matched) {
        setSelectedEvent(matched)
      }
    }
  }, [id, notNullEvents])

  const tags = notNullEvents.length > 0
    ? [...new Set(notNullEvents.flatMap(event => event.tags || []))]
    : [];

  const organizations = notNullEvents.length > 0
    ? [...new Set(notNullEvents.map(event => event.eventOwner?.orgName || event.orgName || "Admin-created"))]
    : [];

  const handleCardClick = event => setSelectedEvent(event)

  const handleTagChange = tag => {
    setSelectedTag(tag)
    setSelectedEvent(null)
  }

  const handleDateChange = date => {
    setSelectedDate(date)
    setSelectedEvent(null)
  }

  const handleOrganizationChange = orgName => {
    setSelectedOrganization(orgName)
    setSelectedEvent(null)
  }

  const handleRegister = selectedEvent => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate("/register", { state: { selectedEvent } });
  };

  const handleGenerateQr = (selectedEvent) => {
    const ticket = selectedEvent.tickets?.find(t => t.userId === user?.id);
    if (ticket?.qrToken) setToken(ticket.qrToken);
  };

  const handleSeeRegistration = (selectedEvent) => {
    const ticket = selectedEvent.tickets?.find(t => t.userId === user?.id);
    if (ticket?.qrToken) setToken(ticket.qrToken);
  };

  const handleEditEvent = (selectedEvent) => {
    const eventId = selectedEvent.id;
    navigate(`/edit/${eventId}`);
  };

  const handleDeleteEvent = async (ev) => {
    if (!ev?.id) return;
    const ok = window.confirm(`Delete "${ev.title}"? This can’t be undone.`);
    if (!ok) return;
  
    try {
      const res = await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
      if (!(res.ok || res.status === 204)) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Delete failed");
      }
  
      // Update UI without reloading (prevents “logout”)
      setSelectedEvent(null);
      if (typeof onDeleted === "function") onDeleted(ev.id);
    } catch (e) {
      console.error(e);
      alert(e.message || "Could not delete event.");
    }
  };

  const handleBack = () => setToken("");
  const handleClose = () => {
    setSelectedEvent(null);
    setToken("");

    if (isMyEvent) {
      navigate("/myEvents");
    } else if (isRegistrations) {
      navigate("/registrations");
    } else {
      navigate("/discover");
    }
  };

  // format functions
  const formattedCost = cost => {
    if (cost === 0 || !cost) return 'FREE'
    return `$${cost}`
  }

  const formattedDate = (date) => new Date(date).toLocaleDateString();
  const formattedTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const filteredEvents = notNullEvents.filter(event => {
    if (selectedTag && (!event.tags || !event.tags.includes(selectedTag))) return false;
    if (selectedOrganization) {
      const eventOrg = event.eventOwner?.orgName || event.orgName || "Admin-created";
      if (eventOrg !== selectedOrganization) return false;
    }
    if (selectedDate) {
      const eventDate = new Date(event.date);
      const filterDate = new Date(selectedDate + 'T00:00:00');
      if (eventDate.toDateString() !== filterDate.toDateString()) return false;
    }
    if (isRegistrations && !event.eventAttendees?.some(a => a.id === user?.id)) return false;
    if (isMyEvent) {
      const ownerId = event.eventOwner?.id ?? event.eventOwnerId ?? null;
      if (!org || ownerId !== Number(org.id)) return false;
    }
    return true;
  });

  const qrValue = token ? JSON.stringify({ t: token }) : "";
  const attendeesCount = selectedEvent?.eventAttendees?.length ?? 0;
  const spotsLeft = selectedEvent ? Math.max(0, (selectedEvent.maxAttendees ?? 0) - attendeesCount) : 0;
  const alreadyRegistered = selectedEvent && user
    ? selectedEvent.eventAttendees?.some(a => a.id === user.id)
    : false;
  const byOrgName = selectedEvent?.eventOwner?.orgName || selectedEvent?.orgName || "Admin-created";

  return (
    <div className="discover-page">
      <h1>
        {!isRegistrations ? (!isMyEvent ? "Discover Events" : "My Events") : "Events Registered To"} ({filteredEvents.length} events)
      </h1>

      {(!isRegistrations && !isMyEvent) && (
        <div className="filters-card">
          <Filters
            tags={tags}
            organizations={organizations}
            onTagChange={handleTagChange}
            onDateChange={handleDateChange}
            onOrganizationChange={handleOrganizationChange}
          />
        </div>
      )}

      <div className="event-grid">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} onClick={handleCardClick} />
        ))}
      </div>

      {selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <img
              src={selectedEvent.imageUrl || "https://rcsurqillaykjdtmzfed.supabase.co/storage/v1/object/public/event-images/default_event_image.png"}
              alt={selectedEvent.title}
              className="modal-image"
            />
            <h2>{selectedEvent.title}</h2>
            {!token ? (
              <>
                <p>{formattedDate(selectedEvent.date)} • {formattedTime(selectedEvent.date)}</p>
                <p>Location: {selectedEvent.locationName}</p>
                <p>By: {byOrgName}</p>
                <p>{selectedEvent.description}</p>
                <p>Max Attendees: {selectedEvent.maxAttendees}</p>
                <p>Places Left: {spotsLeft}</p>
                <p>Cost: {formattedCost(selectedEvent.cost)}</p>

                {!isRegistrations ? (
                  (!org && spotsLeft !== 0) && (
                    <button
                      className="register-btn"
                      onClick={alreadyRegistered ? () => handleSeeRegistration(selectedEvent) : () => handleRegister(selectedEvent)}
                    >
                      {alreadyRegistered ? "See Registration" : "Register"}
                    </button>
                  )
                ) : (
                  <button
                    className="register-btn"
                    onClick={() => handleGenerateQr(selectedEvent)}
                  >
                    Get QR Code
                  </button>
                )}

                {isMyEvent && (
                  <>
                    <button
                      className="register-btn"
                      onClick={() => handleEditEvent(selectedEvent)}
                    >
                      Edit Event
                    </button>
                    <button
                      className="register-btn analytics-btn"
                      onClick={() => navigate(`/events/${selectedEvent.id}/analytics`)}
                    >
                      View Analytics
                    </button>
                    <button
                      className="register-btn danger"
                      onClick={() => handleDeleteEvent(selectedEvent)}
                    >
                      Delete Event
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="qr-decoded">
                  <strong>Token:</strong> {token}
                </div>
                <div className="qr-preview">
                  <QRCode value={qrValue} size={220} />
                </div>
                <div style={{ width: '100%', height: '20px' }}></div>
                <button className="register-btn" onClick={handleBack}>
                  Details
                </button>
              </>
            )}
            <button className="close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Discover
