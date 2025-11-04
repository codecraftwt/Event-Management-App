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
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
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
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadFileName, setUploadFileName] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error'
  const [uploading, setUploading] = useState(false);

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
    setUploadedImage(null);
    setUploadFileName(null);
    setUploadStatus(null);
  }, [formData, onSubmit]);

const tagOptions = [
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
                value={formData.tag }
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
                    actionHint={uploading ? "Uploading..." : "Drop image Here"}
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
            </div>
          </FormLayout>
        </Form>
      </Modal.Section>
    </Modal>
  );
}
  