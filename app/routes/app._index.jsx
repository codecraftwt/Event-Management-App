import React, { useState, useEffect } from "react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { json, useLoaderData } from "@remix-run/react";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import Navbar from "./components/Navbar";
import EventFormModal from "./components/EventFormModal";
import EventEditModal from "./components/EventEditModal";

// Hydration-safe wrapper for EventCalendar
import EventCalendar from "./components/EventCalendar";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const events = await prisma.event.findMany({ orderBy: { id: "asc" } });
  return json(events);
};

export default function Index() {
  const eventsData = useLoaderData();
  const [events, setEvents] = useState(eventsData);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Hydration-safe client render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Edit handler
  const handleEditSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/event/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editingEvent.id ? result.event : ev)),
        );
        setEditingEvent(null);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/event/${eventId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const result = await res.json();
      if (result.success) {
        // Remove deleted event from local state
        setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const form = new FormData();
      for (let key in formData) form.append(key, formData[key]);

      const res = await fetch("/api/events", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });

      const result = await res.json();
      if (result.success) {
        handleEventCreated(result.event);
        setShowCreateModal(false);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (event) => {
    try {
      const res = await fetch(`/api/event/${event.id}`, {
        method: "PATCH",
        credentials: "same-origin",
      });
      const result = await res.json();
      if (result.success) {
        // Update local state
        setEvents((prev) =>
          prev.map((ev) => (ev.id === event.id ? result.event : ev)),
        );
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling publish");
    }
  };

  return (
    <AppProvider i18n={enTranslations}>
      <Navbar onCreateClick={() => setShowCreateModal(true)} />
      <div className="app-container">
        {isClient && (
          <EventCalendar
            eventsDataFromDB={events}
            onEdit={(event) => setEditingEvent(event)}
            onDelete={handleDelete} // ✅ pass delete handler
            onTogglePublish={handleTogglePublish} // ✅ pass toggle handler
          />
        )}
      </div>

      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* ✅ Edit Modal */}
      <EventEditModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        eventData={editingEvent}
        onSubmit={handleEditSubmit}
        submitting={submitting}
      />
    </AppProvider>
  );
}
