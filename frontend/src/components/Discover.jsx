import { useState } from "react";
import EventCard from "./EventCard";
//import events from "../data/events";
import "./Discover.css"; // create this CSS file
//import Filters from "./Filters";

//const categories = ["Wellness", "Art", "Food"]; // mock categories, actual categories TBD
//const organizations = ["Org A", "Org B", "Org C"]; // mock list

function Discover({ events }) {

  const safeEvents = events || [];

  //extract tags and organizations from events
  const tags = safeEvents.length > 0 
    ? [...new Set(safeEvents.flatMap(event => event.tags || []))] 
    : [];
    
  const organizations = safeEvents.length > 0 
    ? [...new Set(safeEvents.map(event => event.eventOwner?.orgName || event.orgName || "Unknown"))] 
    : [];

  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleCardClick = (event) => setSelectedEvent(event);

  const handleRegister = (eventId) => {
    alert(`Registered for event ID: ${eventId}`);
    // later: send POST request to backend
  };

   //format cost 
  const formattedCost = (cost) => {
    if (cost === 0 || !cost) return "FREE";
    return `$${cost}`;
  };

  //format date and times
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

  // ADD LOADING STATE
  if (events === null || events === undefined) {
    return (
      <div className="discover-page">
        <h1>Loading events...</h1>
      </div>
    );
  }
  
  return (
    <div className="discover-page">
      <h1>Discover Events ({safeEvents.length} events)</h1>
      {/* <Filters
        tags={tags}
        organizations={organizations}
        onTagChange={handleTagChange}
        onDateChange={handleDateChange}
        onOrganizationChange={handleOrganizationChange}
      /> */}
      <div className="event-grid">
        {/* FIX: Use safeEvents instead of events */}
        {safeEvents.map(event => (
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