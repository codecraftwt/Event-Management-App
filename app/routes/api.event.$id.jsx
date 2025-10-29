import { json } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request, params }) => {
  await authenticate.admin(request);

  const id = parseInt(params.id);
  if (request.method === "PUT") {
    const data = await request.json();

    try {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          title: data.title,
          date: new Date(data.date),
          time: data.time,
          tag: data.tag,
          place: data.place,
          image: data.image,
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
