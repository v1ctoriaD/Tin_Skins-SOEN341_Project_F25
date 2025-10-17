import { useState } from "react";
import EventCard from "./EventCard";
import events from "../data/events";
import "../styles/Discover.css";
import Filters from "./Filters";
import usePageTitle from "../hooks/usePageTitle";

const categories = ["Wellness", "Art", "Food"]; // mock categories, actual categories TBD
const organizations = ["Org A", "Org B", "Org C"]; // mock list

function Discover(/*{ events }*/) {
  usePageTitle();

  const handleCategoryChange = (category) => {
    console.log("Selected category:", category);
    // connect API here
  };

  const handleDateChange = (date) => {
    console.log("Selected date:", date);
    // connect API here
  };

    const handleOrganizationChange = (org) => {
    console.log("Selected organization:", org);
    // connect API here
  };

  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleCardClick = (event) => setSelectedEvent(event);

  const handleRegister = (eventId) => {
    alert(`Registered for event ID: ${eventId}`);
    // later: send POST request to backend
  };

  return (
    <div className="discover-page">
      <h1>Discover Events</h1>
      <Filters
        categories={categories}
        organizations={organizations}
        onCategoryChange={handleCategoryChange}
        onDateChange={handleDateChange}
        onOrganizationChange={handleOrganizationChange}
      />
      <div className="event-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} onClick={handleCardClick} />
        ))}
      </div>

      {selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <img src={selectedEvent.image} alt={selectedEvent.title} className="modal-image" />
            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.date} • {selectedEvent.time}</p>
            <p>{selectedEvent.location}</p>
            <p>{selectedEvent.description}</p>
            <p>Spots left: {selectedEvent.spotsLeft}</p>
            <button className="register-btn" onClick={() => handleRegister(selectedEvent.id)}>Register</button>
            <button className="close-btn" onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Discover;