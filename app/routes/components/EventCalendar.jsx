import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card } from "@shopify/polaris";
import { Link } from "@remix-run/react";
import "./Navbar.css";

export default function EventCalendar({
  eventsDataFromDB = [],
  onEdit,
  onDelete,
  onTogglePublish,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [view, setView] = useState("month");

  // ✅ Convert date strings to JS Date objects
  const eventsData = eventsDataFromDB.map((event) => ({
    ...event,
    date: new Date(event.date),
  }));

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilterTag(e.target.value);

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === "All" || event.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  // const tileContent = ({ date, view }) => { // if (view === "month") { // const dayEvents = filteredEvents.filter( // (event) => event.date.toDateString() === date.toDateString() // ); // return dayEvents.map((event, idx) => ( // <Link // key={idx} // to={event/${event.id}} // style={{ textDecoration: "none" }} // > // <span className="event-badge">{event.title}</span> // </Link> // )); // } // return null; // };

  return (
    <div className="calendar-container">
      <Card sectioned>
        {" "}
        {/* 🔎 Search & Filter */}
        <div className="controls">
          {" "}
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            value={filterTag}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option>All</option> <option>Music</option>
            <option>Education</option>
            <option>Online</option>
          </select>
          {/* 🗓 View Toggle */}
          <div className="view-toggle">
            <button
              onClick={() => setView("list")}
              className={view === "list" ? "active" : ""}
            >
              {" "}
              List{" "}
            </button>
          </div>
        </div>
        <ul className="event-list">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, idx) => (
              <li key={idx} className="event-item">
                <Link to={`event/${event.id}`} className="event-link">
                  <span>{event.title}</span>
                  <hr />
                  <span className="event-date">
                    {event.date.toDateString()}
                  </span>
                </Link>
                <span className="buttons">
                  {/* Edit */}
                  <button onClick={() => onEdit(event)} className="editbtn">
                    Edit
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => onDelete(event.id)}
                    className="deletebtn"
                  >
                    Delete
                  </button>
                  {/* Publish/Unpublish */}
                  <button
                    onClick={() => onTogglePublish(event)}
                    className="publishbtn"
                  >
                    {event.published ? "Unpublish" : "Publish"}
                  </button>
                </span>
              </li>
            ))
          ) : (
            <li className="no-events">No events found.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
