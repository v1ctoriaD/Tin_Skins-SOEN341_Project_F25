// src/components/Banner.jsx
import React from "react";
import "../styles/tokens.css";
import "../styles/Banner.css";

export default function Banner() {
  return (
    <section className="banner">
      <div className="banner-content left">
        <h1>Experience Campus Life Like Never Before</h1>
        <p>
          Discover and participate in the events that make Concordia come alive.
          From club activities and networking sessions to workshops and social gatherings —
          find the experiences that fit your passions and schedule.
        </p>
        <div className="banner-buttons">
          <a className="button" href="/discover">Explore Events</a>
          <a className="button create-btn" href="/create">Host Your Own</a>
        </div>
      </div>
    </section>
  );
}