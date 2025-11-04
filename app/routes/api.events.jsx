import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

// ✅ GET /api/events
export async function loader() {
  try {
    const events = await prisma.event.findMany({
      where: {
        published: true, // ✅ only fetch published events
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        title: true,
        date: true,
        isMultipleDay: true,
        startDate: true,
        endDate: true,
        time: true,
        tag: true,
        place: true,
        image: true,
        description: true,
      },
    });

    return json(events, {
      headers: {
        "Access-Control-Allow-Origin": "*", // allow requests from Shopify theme
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Loader Error:", error);
    return json({ error: "Failed to load events" }, { status: 500 });
  }
}

// ✅ POST /api/events
export const action = async ({ request }) => {
  await authenticate.admin(request);

  const form = await request.formData();
  const title = form.get("title");
  const isMultipleDay = form.get("isMultipleDay") === "true";
  const date = form.get("date");
  const startDate = form.get("startDate");
  const endDate = form.get("endDate");
  const time = form.get("time");
  const startTime = form.get("startTime");
  const endTime = form.get("endTime");
  const fromTime = form.get("fromTime");
  const fromStartTime = form.get("fromStartTime");
  const fromEndTime = form.get("fromEndTime");
  const toTime = form.get("toTime");
  const toStartTime = form.get("toStartTime");
  const toEndTime = form.get("toEndTime");
  const tag = form.get("tag");
  const place = form.get("place");
  const image = form.get("image");
  const description = form.get("description");

  if (!title) {
    return json(
      { success: false, error: "Title is required" },
      { status: 400 },
    );
  }

  if (isMultipleDay) {
    if (!startDate || !endDate || startDate.trim() === "" || endDate.trim() === "") {
      return json(
        { success: false, error: "Start date and end date are required for multiple day events" },
        { status: 400 },
      );
    }
  } else {
    if (!date || date.trim() === "") {
      return json(
        { success: false, error: "Date is required for single day events" },
        { status: 400 },
      );
    }
  }

  let parsedDate = null;
  let parsedStartDate = null;
  let parsedEndDate = null;

  if (date && date.trim() !== "") {
    parsedDate = new Date(date + "T00:00:00");
    if (isNaN(parsedDate.getTime())) {
      return json(
        { success: false, error: "Invalid date format" },
        { status: 400 },
      );
    }
  }

  if (startDate && startDate.trim() !== "") {
    parsedStartDate = new Date(startDate + "T00:00:00");
    if (isNaN(parsedStartDate.getTime())) {
      return json(
        { success: false, error: "Invalid start date format" },
        { status: 400 },
      );
    }
  }

  if (endDate && endDate.trim() !== "") {
    parsedEndDate = new Date(endDate + "T00:00:00");
    if (isNaN(parsedEndDate.getTime())) {
      return json(
        { success: false, error: "Invalid end date format" },
        { status: 400 },
      );
    }
  }

  try {
    const created = await prisma.event.create({
      data: {
        title,
        date: parsedDate,
        isMultipleDay,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        time: time || "",
        startTime: startTime || "",
        endTime: endTime || "",
        fromTime: fromTime || "",
        fromStartTime: fromStartTime || "",
        fromEndTime: fromEndTime || "",
        toTime: toTime || "",
        toStartTime: toStartTime || "",
        toEndTime: toEndTime || "",
        tag: tag || "",
        place: place || "",
        image: image || null,
        description: description || "",
      },
    });

    return json({ success: true, event: created });
  } catch (err) {
    console.error("🔥 Prisma Error:", err);
    return json(
      { success: false, error: "Failed to create event" },
      { status: 500 },
    );
  }
};
