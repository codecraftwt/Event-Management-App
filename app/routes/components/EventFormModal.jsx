import React, { useState } from "react";
import "./EventFormModal.css";

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    tag: "",
    place: "",
    image: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Create Event</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event title"
            required
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
          />
          <input
            type="text"
            name="time"
            placeholder="7:00 PM - 10:00 PM"
            value={formData.time}
            onChange={handleChange}
          />
          <input
            type="text"
            name="tag"
            placeholder="Music / Workshop / Online"
            value={formData.tag}
            onChange={handleChange}
          />
          <input
            type="text"
            name="place"
            placeholder="Venue or Zoom link"
            value={formData.place}
            onChange={handleChange}
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="button-container">
            <button
              type="submit"
              disabled={submitting}
              className="primary-button"
            >
              {submitting ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="secondary-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
  