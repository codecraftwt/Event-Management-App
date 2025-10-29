import React, { useState, useEffect } from "react";

export default function EventEditModal({
  isOpen,
  onClose,
  eventData,
  onSubmit,
  submitting,
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

  // Pre-fill with eventData when modal opens
  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title || "",
        date: eventData.date
          ? new Date(eventData.date).toISOString().split("T")[0]
          : "",
        time: eventData.time || "",
        tag: eventData.tag || "",
        place: eventData.place || "",
        image: eventData.image || "",
        description: eventData.description || "",
      });
    }
  }, [eventData]);

  // Add error state
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date) {
      setError("Title and Date are required");
      return;
    }

    setError("");
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Edit Event</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="time"
            value={formData.time}
            onChange={handleChange}
            placeholder="Time"
          />
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            placeholder="Tag"
          />
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            placeholder="Place"
          />
          <input
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />
        <div className="button-container">
          <button type="submit" disabled={submitting} className="primary-button">
            {submitting ? "Updating..." : "Update Event"}
          </button>
          <button type="button" onClick={onClose} className="secondary-button">
            Cancel
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}
