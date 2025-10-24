import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import "../styles/Discover.css";
import "../styles/qr.css";
import Filters from "./Filters";
import usePageTitle from "../hooks/usePageTitle";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";



function Discover({ events, user, org, isDiscovering }) {
  usePageTitle();
  const navigate = useNavigate();
  const notNullEvents = events || [];

  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if(!isDiscovering && !user) {
      navigate('/');
      return;
    }
  }, [isDiscovering, user, navigate]);

  // fetch tags and organizations from events
  const tags = notNullEvents.length > 0
    ? [...new Set(notNullEvents.flatMap(event => event.tags || []))]
    : [];

  const organizations = notNullEvents.length > 0
    ? [...new Set(notNullEvents.map(event => event.eventOwner?.orgName || event.orgName || "Unknown"))]
    : [];

  const handleCardClick = (event) => setSelectedEvent(event);

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setSelectedEvent(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const handleOrganizationChange = (orgName) => {
    setSelectedOrganization(orgName);
    setSelectedEvent(null);
  };

  const handleRegister = (selectedEvent) => {
    if(!user) {
      navigate("/login");
      return;
    }
    navigate("/tickets/claim/", { state: { selectedEvent } });
    return;
  };

  //for events registered to
  const handleGenerateQr = (selectedEvent) => {
    const ticket = selectedEvent.tickets.find(t => t.userId === user.id);
    setToken(ticket.qrToken);
    return;
  }

  const handleSeeRegistration = (selectedEvent) => {
    const ticket = selectedEvent.tickets.find(t => t.userId === user.id);
    setToken(ticket.qrToken);
    return;
  }

  const handleBack = () => {
    setToken("");
    return;
  }

  const handleClose = () => {
    setSelectedEvent(null);
    setToken("");
    return;
  }

  // format functions
  const formattedCost = (cost) => {
    if (cost === 0 || !cost) return "FREE";
    return `$${cost}`;
  };

  const formattedDate = (date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString();
  };
  
  const formattedTime = (date) => { 
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  
  const filteredEvents = notNullEvents.filter(event => {
    // filter by category/tag
    if (selectedTag && (!event.tags || !event.tags.includes(selectedTag))) {
      return false;
    }

    // filter by org name
    if (selectedOrganization) {
      const eventOrg = event.eventOwner?.orgName || event.orgName || "Unknown";
      if (eventOrg !== selectedOrganization) {
        return false;
      }
    }

    // filter by date
    if (selectedDate) {
      const eventDate = new Date(event.date);
      const filterDate = new Date(selectedDate + 'T00:00:00'); 
      
      console.log({
        selectedDate,
        eventDate: eventDate.toDateString(),
        filterDate: filterDate.toDateString(),
        eventTitle: event.title
      });
      
      if (eventDate.toDateString() !== filterDate.toDateString()) {
        return false;
      }
    }

    //Filter for Registration page
    if(!isDiscovering && !event.eventAttendees.some(attendee => attendee.id === user?.id)) {
      return false;
    }

    return true;
  });

  const qrValue = token ? JSON.stringify({ t: token }) : "";

  return (
    <div className="discover-page">
      
      <h1>{isDiscovering? "Discover Events" : "Events Registered To"} ({filteredEvents.length} events)</h1>
      
      {isDiscovering && <Filters
        tags={tags}
        organizations={organizations}
        onTagChange={handleTagChange}
        onDateChange={handleDateChange}
        onOrganizationChange={handleOrganizationChange}
      />}
      
      <div className="event-grid">
        
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} onClick={handleCardClick} />
        ))}
      </div>

      {selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <img 
              src={selectedEvent.imageUrl} 
              alt={selectedEvent.title} 
              className="modal-image" 
            />
            <h2>{selectedEvent.title}</h2>
            {!token ? (<>
              <p>{formattedDate(selectedEvent.date)} • {formattedTime(selectedEvent.date)}</p>
              <p>Location: {selectedEvent.locationName}</p>
              <p>By: {selectedEvent.eventOwner.orgName}</p>
              <p>{selectedEvent.description}</p>
              <p>Max Attendees: {selectedEvent.maxAttendees}</p>
              <p>Places Left: {selectedEvent.maxAttendees - selectedEvent.eventAttendees.length}</p>
              <p>Cost: {formattedCost(selectedEvent.cost)}</p>
              {isDiscovering? ((!org && selectedEvent.maxAttendees - selectedEvent.eventAttendees.length !== 0) && <button 
                className="register-btn" 
                onClick={(user && selectedEvent.eventAttendees.some(attendee => attendee.id === user?.id)) ? () => handleSeeRegistration(selectedEvent) : () => handleRegister(selectedEvent)}
              >
                {(user && selectedEvent.eventAttendees.some(attendee => attendee.id === user?.id)) ? "See Registration" : "Register"}
              </button>) : (
                <button
                  className="register-btn"
                  onClick={() => handleGenerateQr(selectedEvent)}
                >
                  Get QR Code
                </button>
              )} 
            </>) : (
              <>
                <div className="qr-decoded">
                  <strong>Token:</strong> {token}
                </div>
                <div className="qr-preview">
                  <QRCode value={qrValue} size={220} />
                </div>
                <br />
                <div style={{
                  width: '100%',
                  height: '20px',
                }}></div>
                <button
                  className="register-btn"
                  onClick={handleBack}
                >
                  Details
                </button>
              </>
            )}
            <button 
              className="close-btn" 
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Discover;