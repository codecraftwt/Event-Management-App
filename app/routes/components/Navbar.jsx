import React from "react";
import "./Navbar.css";

const Navbar = ( { onCreateClick } ) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img
            src="https://demo.wp-eventmanager.com/wp-content/uploads/2023/03/cropped-wpem-logo.png"
            alt="Event Calendar Logo"
          />
        </div>

        {/* Links */}
        <ul className="navbar-links">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Events</a>
          </li>
          <li>
            <a href="#">Tickets</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>

        {/* Button */}
        <div className="navbar-button">
          {/* <a href="/create-event" className="btn-primary">Create Event</a> */}
          <button onClick={onCreateClick} className="btn-create">
            Create Event
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
