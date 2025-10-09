import React from "react";

function EventCard({ event, onClick }) {
  return (
    <div className="event-card" onClick={() => onClick(event)}>
      <img src={event.image} alt={event.title} className="event-image" />
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>{event.date} • {event.time}</p>
        <p>{event.location}</p>
        <span className={`category-badge ${event.category.toLowerCase()}`}>
          {event.category}
        </span>
      </div>
    </div>
  );
}

export default EventCard;