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
  const date = form.get("date");
  const time = form.get("time");
  const tag = form.get("tag");
  const place = form.get("place");
  const image = form.get("image");
  const description = form.get("description");

  if (!title || !date) {
    return json(
      { success: false, error: "Title and date are required" },
      { status: 400 },
    );
  }

  const parsedDate = new Date(date + "T00:00:00");
  if (isNaN(parsedDate.getTime())) {
    return json(
      { success: false, error: "Invalid date format" },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.event.create({
      data: {
        title,
        date: parsedDate,
        time: time || "",
        tag: tag || "",
        place: place || "",
        image: image,
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
