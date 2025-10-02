// src/components/Banner.jsx
import React from "react";
import "../styles/tokens.css";

export default function Banner() {
  return (
    <section style={{
      background:"linear-gradient(135deg, var(--color-surface), var(--color-bg))",
      padding:"48px 16px"
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <h1 style={{ fontSize:48, margin:0, color:"var(--color-primary)" }}>
          Discover campus events your way
        </h1>
        <p style={{ color:"var(--color-subtext)" }}>
          Find clubs, shows, workshops and more across campus
        </p>
        <div style={{ marginTop:"16px" }}>
          <a className="button" href="/discover">See events</a>
          <a className="button" style={{ marginLeft:"12px", background:"var(--color-accent)" }}>
            Create an event
          </a>
        </div>
      </div>
    </section>
  );
}