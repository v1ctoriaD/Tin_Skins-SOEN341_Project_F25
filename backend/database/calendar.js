
/**
 * Build an ICS (.ics / iCalendar) string for an event.
 * Uses America/Toronto timezone for all events
 * @param {Object} event - prisma event record (should include eventOwner)
 * @returns {String} ICS content
 */
export function buildIcsForEvent(event) {
  if (!event) return null;

  const toICSDate = (d) => {
    const dt = new Date(d);
    return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Generate unique identifier for the event
  const uid = `event-${event.id}@campus-connect.local`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(event.date);
  
  // Default event duration is 2 hours if not specified
  const dtEndDate = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000);
  const dtend = toICSDate(dtEndDate);

  // Clean and escape text fields
  const summary = escapeIcsText(event.title || 'Event');
  const description = escapeIcsText(event.description || '');
  const location = escapeIcsText(event.locationName || '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Connect//NONSGML Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ];

  return lines.join('\r\n');
}

/**
 * Escape special characters in ICS text fields
 */
function escapeIcsText(text) {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}