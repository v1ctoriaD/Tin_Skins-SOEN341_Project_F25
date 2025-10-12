import React from "react";
import "../styles/tokens.css";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaSearch, FaUser, FaBars } from "react-icons/fa";

import { Link } from "react-router-dom";
import logo from "../assets/Logo.png";

export default function Navbar() {
  return (
    <header className="navbar-header" style={{ borderBottom: "1px solid #ccc", padding: "8px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
        <div>
          {/* Social media icons (top left) */}
            <a href="https://twitter.com" className="nav-logo"><FaTwitter /></a>
            <a href="https://facebook.com" className="nav-logo"><FaFacebook /></a>
            <a href="https://instagram.com" className="nav-logo"><FaInstagram /></a>
            <a href="https://linkedin.com" className="nav-logo"><FaLinkedin /></a>
        </div>
        </div>
       
          {/* Site name (on top) */}
        <div className ="nav-center">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="Campus Event Logo" className="nav-logo-img"/>
          </Link> 
        </div>
         


         {/* User icons (top right) */}
        <div style={{ textAlign: "right" }}>
          <div>
            <Link to="/discover" className="nav-logo"><FaSearch /></Link>
            <Link to="/login" className="nav-logo"><FaUser /></Link>
            <Link to="#" className="nav-logo"><FaBars /></Link>
        </div>
        </div>
      </div>


      {/* Center options row */}
      <nav style={{ marginTop: "8px", textAlign: "center"}}>
        <Link to="/" className="nav-option">Home</Link>
        <Link to="/discover" className="nav-option">Discover</Link>
        <a href="/map" className="nav-option">Map</a>
        <a href="#" className="nav-option">Option</a>
        <a href="#" className="nav-option">Option</a>
        <a href="#" className="nav-option">Option</a>
        <div className="nav-item has-dropdown">
          <span className="nav-option">QR Code Test ▾</span>
          <div className="dropdown">
            <Link className="dropdown-link" to="/qr/generate">Generate QR</Link>
            <Link className="dropdown-link" to="/qr/scan">Scan from Image</Link>
          </div>
        </div> 
        <a href="#" className="nav-option">About Us</a>
      </nav>
    </header>
  );
}