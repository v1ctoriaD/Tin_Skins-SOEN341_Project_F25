// src/components/Banner.jsx
import { Link } from "react-router-dom";
import "../styles/tokens.css";
import "../styles/Banner.css";
import usePageTitle from "../hooks/usePageTitle";

export default function Banner() {
  usePageTitle();
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
          <Link className="button" to="/discover">
            Explore Events
          </Link>
          <Link className="button create-btn" to="/create">
            Host Your Own
          </Link>
        </div>
      </div>
    </section>
  );
}