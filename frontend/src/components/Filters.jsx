import React, { useState } from "react";

function Filters({ categories, onCategoryChange, onDateChange }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (onCategoryChange) onCategoryChange(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (onDateChange) onDateChange(e.target.value);
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
    </div>
  );
}

export default Filters;