import { useState } from "react";
import EventCard from "./EventCard";

import "./Discover.css"; // create this CSS file
import Filters from "./Filters";


function Discover({ events }) {
  const notNullEvents = events || [];

  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const handleRegister = (eventId) => {
    alert(`Registered for event ID: ${eventId}`);
  };

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

  // FIXED: Use notNullEvents instead of events
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

    return true;
  });

  

  return (
    <div className="discover-page">
      
      <h1>Discover Events ({filteredEvents.length} events)</h1>
      
      <Filters
        tags={tags}
        organizations={organizations}
        onTagChange={handleTagChange}
        onDateChange={handleDateChange}
        onOrganizationChange={handleOrganizationChange}
      /> 
      
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
            <p>{formattedDate(selectedEvent.date)} • {formattedTime(selectedEvent.date)}</p>
            <p>{selectedEvent.locationName}</p>
            <p>{selectedEvent.description}</p>
            <p>Max Attendees: {selectedEvent.maxAttendees}</p>
            <p>Cost: {formattedCost(selectedEvent.cost)}</p>
            <button 
              className="register-btn" 
              onClick={() => handleRegister(selectedEvent.id)}
            >
              Register
            </button>
            <button 
              className="close-btn" 
              onClick={() => setSelectedEvent(null)}
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