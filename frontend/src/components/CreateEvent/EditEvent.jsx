import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TAGS = [
  "WORKSHOP","SEMINAR","LECTURE","STUDY_SESSION","HACKATHON","BOOTCAMP","RESEARCH_SYMPOSIUM","COMPETITION","EXAM_PREP","TUTORING",
  "CAREER_FAIR","INFO_SESSION","NETWORKING","RESUME_CLINIC","INTERVIEW_PREP","INTERNSHIP_FAIR","COMPANY_VISIT","PANEL_DISCUSSION","ALUMNI_MEETUP","ENTREPRENEURSHIP",
  "PARTY","MIXER","CLUB_FAIR","GAME_NIGHT","MOVIE_NIGHT","CULTURAL_FESTIVAL","CONCERT","TALENT_SHOW","STUDENT_GALA","SPORTS_GAME",
  "FUNDRAISER","CHARITY_EVENT","CLEANUP_DRIVE","BLOOD_DRIVE","VOLUNTEERING","AWARENESS_CAMPAIGN","DONATION_DRIVE","MENTORSHIP",
  "MEDITATION","YOGA","FITNESS_CLASS","MENTAL_HEALTH","SELF_DEVELOPMENT","MINDFULNESS","NUTRITION_TALK","COUNSELING_SESSION",
  "CODING_CHALLENGE","TECH_TALK","AI_ML_WORKSHOP","STARTUP_PITCH","ROBOTICS_DEMO","CYBERSECURITY","PRODUCT_SHOWCASE",
  "CULTURAL_NIGHT","LANGUAGE_EXCHANGE","INTERNATIONAL_MEETUP","PRIDE_EVENT","HERITAGE_CELEBRATION","INCLUSION_WORKSHOP",
  "ART_EXHIBIT","PHOTOGRAPHY_CONTEST","FILM_SCREENING","THEATER_PLAY","OPEN_MIC","DANCE_PERFORMANCE","MUSIC_JAM",
  "ECO_WORKSHOP","RECYCLING_DRIVE","CLIMATE_TALK","GREEN_TECH","TREE_PLANTING","SUSTAINABILITY",
  "FREE_ENTRY","PAID_EVENT","ON_CAMPUS","OFF_CAMPUS","VIRTUAL","HYBRID","FOOD_PROVIDED","CERTIFICATE_AVAILABLE","TEAM_EVENT","SOLO_EVENT"
];

export default function EditEvent({ org, user, onUpdated }) {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);
  const isOrganizer = !!org;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // yyyy-MM-ddTHH:mm for input
  const [location, setLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(0);
  const [cost, setCost] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  // Tags UX same as CreateEvent:
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagToAdd, setTagToAdd] = useState("");

  // Auth guard
  useEffect(() => {
    if (!(isAdmin || isOrganizer)) {
      navigate("/login");
    }
  }, [isAdmin, isOrganizer, navigate]);

  // Load current event
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/getEvents");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();

        const evt = (data.events || []).find((e) => e.id === Number(eventId));
        if (!evt) {
          setMsg("Event not found");
          setLoading(false);
          return;
        }

        setTitle(evt.title || "");
        setDescription(evt.description || "");

        const d = new Date(evt.date);
        const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDate(isoLocal);

        setLocation(evt.locationName || "");
        setMaxAttendees(evt.maxAttendees || 0);
        setCost(Number(evt.cost) || 0);
        setImageUrl(evt.imageUrl || "");
        setSelectedTags(Array.isArray(evt.tags) ? evt.tags : []);
      } catch (e) {
        setMsg("Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const onAddTag = () => {
    if (!tagToAdd) return;
    if (!selectedTags.includes(tagToAdd)) {
      setSelectedTags((prev) => [...prev, tagToAdd]);
    }
    setTagToAdd("");
  };

  const removeTag = (tag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    try {
      // Check if date is in the past
      if (date) {
        const selectedDate = new Date(date);
        const now = new Date();
        if (selectedDate < now) {
          setMsg("Cannot update event with a date in the past. Please select a present or future date.");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          cost: Number(cost),
          maxAttendees: Number(maxAttendees),
          date: new Date(date).toISOString(),
          locationName: location,
          tags: selectedTags,
          imageUrl: imageUrl || null
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update event");
      }

      const { event } = await res.json();
      if(onUpdated) onUpdated(event);
        setMsg("✅ Event updated successfully!");
      setTimeout(() => { navigate("/myEvents"); }, 600);

    } catch (e2) {
      setMsg(`⚠️ ${e2.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <div className="create-page">
      <div className="create-container">
        <h2>Edit Event</h2>

        <form className="create-form" onSubmit={handleSave}>
          <div className="form-row">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Date and time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Max attendees</label>
              <input
                type="number"
                min="0"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-row">
              <label>Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-row">
            <label>Image URL</label>
            <input
              type="url"
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Tags UI same as CreateEvent */}
          <div className="form-row tag-picker">
            <label>Tags</label>
            <select
              className="tag-select"
              value={tagToAdd}
              onChange={(e) => setTagToAdd(e.target.value)}
            >
              <option value="">Add a tag…</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onAddTag}>
                Add tag
              </button>
              <span className="tag-hint">Click a pill to remove it.</span>
            </div>

            <div className="selected-tags">
              {selectedTags.map((t) => (
                <span key={t} className="tag-pill" onClick={() => removeTag(t)}>
                  {t} <span className="tag-x">×</span>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/myEvents")}
            >
              Cancel
            </button>
          </div>

          {msg && <div className="create-message">{msg}</div>}
        </form>
      </div>
    </div>
  );
}