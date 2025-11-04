import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !file.size) {
    return json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return json({ error: "File size exceeds maximum limit of 100MB" }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed" }, { status: 400 });
  }

  try {
    // Step 1: Create staged upload
    const stagedUploadCreateMutation = `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const stagedUploadVariables = {
      input: [
        {
          filename: file.name,
          mimeType: file.type,
          httpMethod: "POST",
          resource: "FILE",
        },
      ],
    };

    const stagedResponse = await admin.graphql(stagedUploadCreateMutation, {
      variables: stagedUploadVariables,
      apiVersion: "2024-10",
    });

    const stagedData = await stagedResponse.json();

    // Handle GraphQL errors
    if (stagedData.errors) {
      console.error("Staged upload GraphQL errors:", stagedData.errors);
      return json(
        { error: "GraphQL error: " + stagedData.errors.map(e => e.message).join(', ') },
        { status: 500 }
      );
    }

    // Handle user errors (e.g., missing scope)
    const userErrors = stagedData.data.stagedUploadsCreate.userErrors;
    if (userErrors.length > 0) {
      const messages = userErrors.map(e => e.message).join(', ');
      console.error("Staged upload user errors:", userErrors);

      if (messages.includes("Access denied")) {
        return json(
          { error: "App missing 'write_files' scope. Please reinstall the app." },
          { status: 403 }
        );
      }

      return json({ error: "Staged upload failed: " + messages }, { status: 500 });
    }

    const stagedTarget = stagedData.data.stagedUploadsCreate.stagedTargets[0];

    // Step 2: Upload file to Shopify's staged URL
    const uploadFormData = new FormData();
    stagedTarget.parameters.forEach((param) => {
      uploadFormData.append(param.name, param.value);
    });
    uploadFormData.append("file", file);

    const uploadResponse = await fetch(stagedTarget.url, {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      console.error("Upload to staged URL failed:", uploadResponse.status, text);
      return json({ error: "Failed to upload file to Shopify" }, { status: 500 });
    }

    // Step 3: Create permanent file in Shopify
   const fileCreateMutation = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        preview {
          ... on MediaPreviewImage {
            image {
              url
              width
              height
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

    const fileCreateVariables = {
      files: [
        {
          alt: file.name,
         contentType: "IMAGE",
          originalSource: stagedTarget.resourceUrl,
        },
      ],
    };

    const fileResponse = await admin.graphql(fileCreateMutation, {
      variables: fileCreateVariables,
      apiVersion: "2024-10",
    });

    const fileData = await fileResponse.json();

    if (fileData.errors) {
      console.error("File create GraphQL errors:", fileData.errors);
      return json(
        { error: "GraphQL error: " + fileData.errors.map(e => e.message).join(', ') },
        { status: 500 }
      );
    }

    const fileUserErrors = fileData.data.fileCreate.userErrors;
    if (fileUserErrors.length > 0) {
      console.error("File create user errors:", fileUserErrors);
      return json(
        { error: "File create failed: " + fileUserErrors.map(e => e.message).join(', ') },
        { status: 500 }
      );
    }

    const uploadedFile = fileData.data.fileCreate.files[0];

    // Extract correct URL (2024-10+)
    // const fileUrl = uploadedFile.preview?.image?.url;
    const fileUrl = stagedTarget.resourceUrl;

    if (!fileUrl) {
      console.error("File created but no URL in preview.image.url:", uploadedFile);
      return json({ error: "File uploaded but no public URL returned" }, { status: 500 });
    }

    // Success!
    return json({ url: fileUrl });

  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error stack:", error.stack);
    return json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
};