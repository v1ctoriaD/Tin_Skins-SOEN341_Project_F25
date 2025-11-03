import { useState } from "react";

function Filters({ tags, organizations, onTagChange, onDateChange, onOrganizationChange }) {
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");


  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
    if (onTagChange) onTagChange(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (onDateChange) onDateChange(e.target.value);
  };

  const handleOrganizationChange = (e) => {
    setSelectedOrganization(e.target.value);
    if (onOrganizationChange) onOrganizationChange(e.target.value);
  };

  return (
    <div className="filters-container">
      <select value={selectedTag} onChange={handleTagChange}>
        <option value="">All Categories</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
      />

      <select value={selectedOrganization} onChange={handleOrganizationChange}>
        <option value="">All Organizations</option>
        {organizations.map((orgName) => (
          <option key={orgName} value={orgName}>{orgName}</option>
        ))}
      </select>
    </div>
  );
}

export default Filters;
