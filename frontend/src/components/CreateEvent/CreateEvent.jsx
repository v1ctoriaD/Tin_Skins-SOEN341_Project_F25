// frontend/src/components/CreateEvent/CreateEvent.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateEvent.css";

/** Copy of your Prisma enum (frontend constant) */
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

export default function CreateEvent({ user, org, onCreated }) {
  const navigate = useNavigate();

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user]);

  // Redirect non-admins who are not orgs
  useEffect(() => {
    const isOrganizer = !!org;
    if (!(isAdmin || isOrganizer)) navigate("/login");
  }, [isAdmin, org, navigate]);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // yyyy-MM-ddTHH:mm (from input)
  const [location, setLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(0);
  const [cost, setCost] = useState(0);
  const [imageUrl, setImageUrl] = useState("");

  // tags
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagToAdd, setTagToAdd] = useState("");

  // admin-only owner picker
  const [ownerId, setOwnerId] = useState(""); // string for <select>
  const [orgs, setOrgs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // load orgs for admin picker
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const res = await fetch("/api/getOrganizations");
        const data = await res.json();
        setOrgs(data.organizations || []);
      } catch {
        setOrgs([]);
      }
    })();
  }, [isAdmin]);

  const onAddTag = () => {
    if (!tagToAdd) return;
    if (!selectedTags.includes(tagToAdd)) {
      setSelectedTags(prev => [...prev, tagToAdd]);
    }
    setTagToAdd("");
  };

  const removeTag = (tag) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Admin must choose an owner
      const eventOwnerId = isAdmin ? Number(ownerId) : Number(org?.id ?? 0);
      if (!eventOwnerId) {
        setMessage("Please select an organization to own this event.");
        setLoading(false);
        return;
      }

      // Normalize numbers and date
      const normalizedCost = Number(String(cost).replace(",", ".")) || 0;
      const normalizedMax = Number(maxAttendees) || 0;
      const whenISO = date ? new Date(date).toISOString() : "";

      const payload = {
        title,
        description,
        cost: normalizedCost,
        maxAttendees: normalizedMax,
        date: whenISO,
        locationName: location,
        latitude: null,
        longitude: null,
        tags: selectedTags,
        eventOwnerId,
        imageUrl: imageUrl || null
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create event");
      }

      const { event } = await res.json();
      if(onCreated && event) onCreated(event);

      setMessage("✅ Event created successfully!");
      setTimeout(() => navigate("/myEvents"), 800);
    } catch (err) {
      console.error(err);
      setMessage(`⚠️ ${err.message || "Error creating event."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-container">
        <h2>Create Event</h2>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Title</label>
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              placeholder="What is this event about?"
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
                placeholder="e.g., Hall Building H-210"
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
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          {/* Admin-only: choose owning organization */}
          {isAdmin && (
            <div className="form-row">
              <label>Event owner (organization)</label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
              >
                <option value="">Select an organization…</option>
                {orgs.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orgName} ({o.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional image URL */}
          <div className="form-row">
            <label>Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          {/* Tags */}
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
            <button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Event"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/myEvents")}
            >
              Cancel
            </button>
          </div>

          {message && <div className="create-message">{message}</div>}
        </form>
      </div>
    </div>
  );
}