import React, { useState } from "react";

function Filters({ categories, organizations, onCategoryChange, onDateChange, onOrganizationChange }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (onCategoryChange) onCategoryChange(e.target.value);
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
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
      />

      <select value={selectedOrganization} onChange={handleOrganizationChange}>
        <option value="">All Organizations</option>
        {organizations.map((org) => (
          <option key={org} value={org}>{org}</option>
        ))}
      </select>
    </div>
  );
}

export default Filters;
