import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  TextField,
  Form,
  FormLayout,
  Select,
  Text,
  Banner,
  RadioButton,
  Button,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
import "./EventFormModal.css";

export default function EventEditModal({
  isOpen,
  onClose,
  eventData,
  onSubmit,
  submitting,
}) {
  const [formData, setFormData] = useState({
    title: "",
    isMultipleDay: false,
    date: "",
    startDate: "",
    endDate: "",
    time: "",
    startTime: new Date(),
    endTime: new Date(),
    fromTime: "",
    fromStartTime: new Date(),
    fromEndTime: new Date(),
    toTime: "",
    toStartTime: new Date(),
    toEndTime: new Date(),
    tag: "",
    place: "",
    image: "",
    description: "",
    price: "",
  });

  const tagOptions = [
    { label: "Music", value: "Music" },
    { label: "Education", value: "Education" },
    { label: "Online", value: "Online" },
    { label: "Workshop", value: "Workshop" },
  ];

  const [formErrors, setFormErrors] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadFileName, setUploadFileName] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error'
  const [uploading, setUploading] = useState(false);

  // Pre-fill with eventData when modal opens
  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title || "",
        isMultipleDay: eventData.isMultipleDay || false,
        date: eventData.date
          ? new Date(eventData.date).toISOString().split("T")[0]
          : "",
        startDate: eventData.startDate
          ? new Date(eventData.startDate).toISOString().split("T")[0]
          : "",
        endDate: eventData.endDate
          ? new Date(eventData.endDate).toISOString().split("T")[0]
          : "",
        time: eventData.time || "",
        startTime: eventData.startTime ? new Date(eventData.startTime) : new Date(),
        endTime: eventData.endTime ? new Date(eventData.endTime) : new Date(),
        fromTime: eventData.fromTime || "",
        fromStartTime: eventData.fromStartTime ? new Date(eventData.fromStartTime) : new Date(),
        fromEndTime: eventData.fromEndTime ? new Date(eventData.fromEndTime) : new Date(),
        toTime: eventData.toTime || "",
        toStartTime: eventData.toStartTime ? new Date(eventData.toStartTime) : new Date(),
        toEndTime: eventData.toEndTime ? new Date(eventData.toEndTime) : new Date(),
        tag: eventData.tag || "",
        place: eventData.place || "",
        image: eventData.image || "",
        description: eventData.description || "",
        price: eventData.price ? eventData.price.toString() : "",
      });
      setUploadedImage(eventData.image || null);
      setFormErrors({});
    }
  }, [eventData]);

  const handleChange = useCallback((field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleDropZoneDrop = useCallback(
    async (_dropFiles, acceptedFiles, _rejectedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setUploadFileName(file.name);
      setUploadStatus(null);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        const result = await response.json();
        if (response.ok && result.url) {
          setUploadedImage(result.url);
          handleChange("image")(result.url);
          setUploadStatus('success');
        } else {
          console.error("Upload failed:", result.error);
          setUploadStatus('error');
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus('error');
      } finally {
        setUploading(false);
      }
    },
    [handleChange]
  );

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
  }, [formData, onSubmit]);



  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit Event"
      primaryAction={{
        content: submitting ? "Updating..." : "Update Event",
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
      <Modal.Section style={{ marginTop: '20px' }}>
        <Form onSubmit={handleSubmit}>
          <FormLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
              <>
                <TextField
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange("date")}
                  error={formErrors.date}
                  requiredIndicator
                />
               <TextField
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange("startTime")}
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange("endTime")}
                />
              </>
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
                  label="From Start Time"
                  type="time"
                  value={formData.fromStartTime}
                  onChange={handleChange("fromStartTime")}
                />
                <TextField
                  label="From End Time"
                  type="time"
                  value={formData.fromEndTime}
                  onChange={handleChange("fromEndTime")}
                />
                <TextField
                  label="To Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange("endDate")}
                  error={formErrors.endDate}
                  requiredIndicator
                />
                 <TextField
                  label="To Start Time"
                  type="time"
                  value={formData.toStartTime}
                  onChange={handleChange("toStartTime")}
                />
                <TextField
                  label="To End Time"
                  type="time"
                  value={formData.toEndTime}
                  onChange={handleChange("toEndTime")}
                />
              </>
            )}
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
            <div>
              <Text variant="bodyMd" as="p">Event Image</Text>
              <DropZone
                accept="image/*"
                type="image"
                onDrop={handleDropZoneDrop}
                disabled={uploading}
              >
                {uploadedImage ? (
                  <Thumbnail
                    size="large"
                    alt="Uploaded image"
                    source={uploadedImage}
                  />
                ) : (
                  <DropZone.FileUpload
                    actionHint={uploading ? "Uploading..." : "Upload image"}
                  />
                )}
              </DropZone>
              {uploading && <Text variant="bodySm">Uploading...</Text>}
              {uploadFileName && !uploading && uploadStatus === 'success' && <Text variant="bodySm" color="success">File uploaded: {uploadFileName}</Text>}
              {uploadFileName && !uploading && uploadStatus === 'error' && <Text variant="bodySm" color="critical">Upload failed: {uploadFileName}</Text>}
            </div>
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              multiline={4}
              placeholder="Event description"
              autoComplete="off"
            />
            <TextField
              label="Price"
              value={formData.price}
              onChange={handleChange("price")}
              placeholder="Event price (optional)"
              autoComplete="off"
            />
            </div>
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
