import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request, params }) => {
  await authenticate.admin(request);

  const id = parseInt(params.id);
  if (request.method === "PUT") {
    const data = await request.json();

    let parsedDate = null;
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (data.date && data.date.trim() !== "") {
      parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) {
        return json({ success: false, error: "Invalid date format" }, { status: 400 });
      }
    }

    if (data.startDate && data.startDate.trim() !== "") {
      parsedStartDate = new Date(data.startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return json({ success: false, error: "Invalid start date format" }, { status: 400 });
      }
    }

    if (data.endDate && data.endDate.trim() !== "") {
      parsedEndDate = new Date(data.endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return json({ success: false, error: "Invalid end date format" }, { status: 400 });
      }
    }

    try {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          title: data.title,
          date: parsedDate,
          isMultipleDay: data.isMultipleDay,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          time: data.time,
          tag: data.tag,
          place: data.place,
          image: data.image || null,
          description: data.description,
        },
      });

      return json({ success: true, event: updated });
    } catch (err) {
      console.error("🔥 Update Error:", err);
      return json({ success: false, error: "Failed to update event" }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    try {
      await prisma.event.delete({ where: { id } });
      return json({ success: true });
    } catch (err) {
      console.error(err);
      return json({ success: false, error: "Failed to delete event" }, { status: 500 });
    }
  }

  if (request.method === "PATCH") {
    try {
      const event = await prisma.event.findUnique({ where: { id } });
      const updated = await prisma.event.update({
        where: { id },
        data: { published: !event.published }, // toggle
      });
      return json({ success: true, event: updated });
    } catch (err) {
      console.error(err);
      return json({ success: false, error: "Failed to toggle publish" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};
