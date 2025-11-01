import React, { useState, useCallback } from "react";
import {
  Modal,
  TextField,
  Button,
  Form,
  FormLayout,
  Select,
  Text,
  Banner,
  RadioButton,
} from "@shopify/polaris";

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  const [formData, setFormData] = useState({
    title: "",
    isMultipleDay: false,
    date: "",
    startDate: "",
    endDate: "",
    time: "",
    tag: "",
    place: "",
    image: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = useCallback((field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (formData.isMultipleDay) {
      if (!formData.startDate) errors.startDate = "Start date is required";
      if (!formData.endDate) errors.endDate = "End date is required";
    } else {
      if (!formData.date) errors.date = "Date is required";
    }
    return errors;
  };

  const handleSubmit = useCallback(() => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit(formData);
    setFormData({
      title: "",
      isMultipleDay: false,
      date: "",
      startDate: "",
      endDate: "",
      time: "",
      tag: "",
      place: "",
      image: "",
      description: "",
    });
  }, [formData, onSubmit]);

  const tagOptions = [
    { label: "Select a tag", value: "" },
    { label: "Music", value: "Music" },
    { label: "Education", value: "Education" },
    { label: "Online", value: "Online" },
    { label: "Workshop", value: "Workshop" },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create New Event"
      primaryAction={{
        content: submitting ? "Creating..." : "Create Event",
        onAction: handleSubmit,
        loading: submitting,
        disabled: submitting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
          disabled: submitting,
        },
      ]}
    >
      <Modal.Section>
        {error && (
          <Banner status="critical">
            <Text variant="bodyMd">{error}</Text>
          </Banner>
        )}
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <TextField
              label="Event Title"
              value={formData.title}
              onChange={handleChange("title")}
              error={formErrors.title}
              placeholder="Enter event title"
              requiredIndicator
              autoComplete="off"
            />
            <div>
              <Text variant="bodyMd" as="p">Event Duration</Text>
              <RadioButton
                label="Single Day"
                checked={!formData.isMultipleDay}
                onChange={() => {
                  handleChange("isMultipleDay")(false);
                  handleChange("startDate")("");
                  handleChange("endDate")("");
                }}
              />
              <RadioButton
                label="Multiple Days"
                checked={formData.isMultipleDay}
                onChange={() => {
                  handleChange("isMultipleDay")(true);
                  handleChange("date")("");
                }}
              />
            </div>
            {!formData.isMultipleDay ? (
              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange("date")}
                error={formErrors.date}
                requiredIndicator
              />
            ) : (
              <>
                <TextField
                  label="From Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange("startDate")}
                  error={formErrors.startDate}
                  requiredIndicator
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange("endDate")}
                  error={formErrors.endDate}
                  requiredIndicator
                />
              </>
            )}
            <TextField
              label="Time"
              value={formData.time}
              onChange={handleChange("time")}
              placeholder="e.g., 7:00 PM - 10:00 PM"
              autoComplete="off"
            />
            <Select
              label="Tag"
              options={tagOptions}
              value={formData.tag}
              onChange={handleChange("tag")}
              placeholder="Select a tag"
            />
            <TextField
              label="Location"
              value={formData.place}
              onChange={handleChange("place")}
              placeholder="Venue or Zoom link"
              autoComplete="off"
            />
            <TextField
              label="Image URL"
              value={formData.image}
              onChange={handleChange("image")}
              placeholder="https://example.com/image.jpg"
              autoComplete="off"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              multiline={4}
              placeholder="Event description"
              autoComplete="off"
            />
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
  