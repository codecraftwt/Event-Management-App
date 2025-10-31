import React, { useState, useMemo } from "react";
import { Card, TextField, Select, Button, Spinner, Text } from "@shopify/polaris";
import { Link } from "@remix-run/react";

export default function EventCalendar({
  eventsDataFromDB = [],
  onEdit,
  onDelete,
  onTogglePublish,
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const filteredEvents = useMemo(() => {
    return eventsDataFromDB.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTag = filterTag === "All" || event.tag === filterTag;
      return matchesSearch && matchesTag;
    });
  }, [eventsDataFromDB, searchTerm, filterTag]);

  const tagOptions = [
    { label: "All", value: "All" },
    { label: "Music", value: "Music" },
    { label: "Education", value: "Education" },
    { label: "Online", value: "Online" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <TextField
            label="Search events"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by title..."
            autoComplete="off"
          />
        </div>
        <div style={{ minWidth: "150px" }}>
          <Select
            label="Filter by tag"
            options={tagOptions}
            value={filterTag}
            onChange={setFilterTag}
          />
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
          <Spinner size="large" />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <Card key={event.id} sectioned>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <Link to={`event/${event.id}`} style={{ textDecoration: "none" }}>
                    <Text variant="headingMd" as="h2">{event.title}</Text>
                  </Link>
                  <Text variant="bodyMd" color="subdued">
                    {event.date.toDateString()} {event.time && `at ${event.time}`}
                  </Text>
                  {event.place && (
                    <Text variant="bodySm" color="subdued">
                      Location: {event.place}
                    </Text>
                  )}
                  {event.tag && (
                    <Text variant="bodySm" color="subdued">
                      Tag: {event.tag}
                    </Text>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <Button
                    size="slim"
                    onClick={() => onEdit(event)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    size="slim"
                    destructive
                    onClick={() => onDelete(event.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                  <Button
                    size="slim"
                    primary={event.published}
                    onClick={() => onTogglePublish(event)}
                    disabled={loading}
                  >
                    {event.published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card sectioned>
            <Text variant="bodyMd" alignment="center">
              No events found.
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
}
