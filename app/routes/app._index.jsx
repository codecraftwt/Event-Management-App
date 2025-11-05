import React, { useState, useCallback, useMemo } from "react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { json, useLoaderData, useFetcher } from "@remix-run/react";
import { Card, Button, Modal, Text, Frame, Toast } from "@shopify/polaris";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import Navbar from "./components/Navbar";
import EventFormModal from "./components/EventFormModal";
import EventEditModal from "./components/EventEditModal";
import EventCalendar from "./components/EventCalendar";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const events = await prisma.event.findMany({ orderBy: { id: "asc" } });
  return json(events);
};

export default function Index() {
  const initialEvents = useLoaderData();
  const fetcher = useFetcher();
  const [events, setEvents] = useState(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((content, error = false) => {
    setToast({ content, error });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleEventCreated = useCallback((newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setShowCreateModal(false);
    showToast("Event created successfully");
  }, [showToast]);

  const handleEditSubmit = useCallback(async (formData) => {
    const dataToSubmit = {
      title: formData.title,
      isMultipleDay: formData.isMultipleDay,
      date: formData.isMultipleDay ? null : formData.date,
      startDate: formData.isMultipleDay ? formData.startDate : null,
      endDate: formData.isMultipleDay ? formData.endDate : null,
      time: formData.time,
      startTime: formData.startTime,
      endTime: formData.endTime,
      fromTime: formData.fromTime,
      fromStartTime: formData.fromStartTime,
      fromEndTime: formData.fromEndTime,
      toTime: formData.toTime,
      toStartTime: formData.toStartTime,
      toEndTime: formData.toEndTime,
      tag: formData.tag,
      place: formData.place,
      image: formData.image,
      description: formData.description,
      price: formData.price,
    };
    fetcher.submit(dataToSubmit, {
      method: "PUT",
      action: `/api/event/${editingEvent.id}`,
      encType: "application/json",
    });
  }, [fetcher, editingEvent]);

  const handleDelete = useCallback(async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    fetcher.submit(null, {
      method: "DELETE",
      action: `/api/event/${eventId}`,
    });
  }, [fetcher]);

  const handleTogglePublish = useCallback(async (event) => {
    fetcher.submit(null, {
      method: "PATCH",
      action: `/api/event/${event.id}`,
    });
  }, [fetcher]);

  // Handle fetcher responses
  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const { success, event, error } = fetcher.data;

      if (success) {
        if (fetcher.formMethod === "PUT") {
          setEvents((prev) =>
            prev.map((ev) => (ev.id === editingEvent.id ? event : ev))
          );
          setEditingEvent(null);
          showToast("Event updated successfully");
        } else if (fetcher.formMethod === "DELETE") {
          setEvents((prev) => prev.filter((ev) => ev.id !== parseInt(fetcher.formAction.split('/').pop())));
          showToast("Event deleted successfully");
        } else if (fetcher.formMethod === "PATCH") {
          setEvents((prev) =>
            prev.map((ev) => (ev.id === event.id ? event : ev))
          );
          showToast(`Event ${event.published ? "published" : "unpublished"} successfully`);
        }
      } else if (error) {
        showToast(error, true);
      }
    }
  }, [fetcher.state, fetcher.data, editingEvent, showToast]);

  const processedEvents = useMemo(() =>
    events.map((event) => ({
      ...event,
      date: event.date ? new Date(event.date) : null,
      startDate: event.startDate ? new Date(event.startDate) : null,
      endDate: event.endDate ? new Date(event.endDate) : null,
    })), [events]
  );

  return (
    <AppProvider i18n={enTranslations}>
      <Frame>
        <Navbar onCreateClick={() => setShowCreateModal(true)} />
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
          <Card>
            <div style={{ padding: "20px" }}>
              <Text variant="headingLg" as="h1">Events Management</Text>
              <div style={{ marginTop: "20px" }}>
                <EventCalendar
                  eventsDataFromDB={processedEvents}
                  onEdit={setEditingEvent}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                  loading={fetcher.state !== "idle"}
                />
              </div>
            </div>
          </Card>
        </div>
      

      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(formData) => {
          const form = new FormData();
          form.append("title", formData.title);
          form.append("isMultipleDay", formData.isMultipleDay);
          if (formData.isMultipleDay) {
            form.append("startDate", formData.startDate);
            form.append("fromStartTime", formData.fromStartTime);
            form.append("fromEndTime", formData.fromEndTime);
            form.append("endDate", formData.endDate);
            form.append("toStartTime", formData.toStartTime);
            form.append("toEndTime", formData.toEndTime);
          } else {
            form.append("date", formData.date);
            form.append("startTime", formData.startTime);
            form.append("endTime", formData.endTime);
          }
          form.append("tag", formData.tag);
          form.append("place", formData.place);
          form.append("image", formData.image);
          form.append("description", formData.description);
          form.append("price", formData.price);
          fetcher.submit(form, { method: "POST", action: "/api/events" });
        }}
        submitting={fetcher.state !== "idle"}
      />

      <EventEditModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        eventData={editingEvent}
        onSubmit={handleEditSubmit}
        submitting={fetcher.state !== "idle"}
      />

      {toast && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={dismissToast}
        />
      )}
        </Frame>   
 </AppProvider>
  );
}
