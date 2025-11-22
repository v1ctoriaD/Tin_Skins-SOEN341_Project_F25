function EventCard({ event, onClick }) {
  //format date
  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString()
  const formattedTime = eventDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="event-card" onClick={() => onClick(event)}>
      <img
        src={
          event.imageUrl ||
          'https://rcsurqillaykjdtmzfed.supabase.co/storage/v1/object/public/event-images/default_event_image.png'
        }
        alt={event.title}
        className="event-image"
      />
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>
          {formattedDate} • {formattedTime}
        </p>
        <p>{event.locationName}</p>
        {event.tags && event.tags.length > 0 && (
          <div className="tags">
            {event.tags.map((tag, index) => (
              <span key={index} className={`category-badge ${tag.toLowerCase()}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventCard
