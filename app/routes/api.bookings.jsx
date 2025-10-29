import { json } from "@remix-run/node";
import prisma from "../db.server"; // adjust path to your Prisma client

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ for testing; later restrict to your shop domain
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const loader = async () => {
  return new Response(JSON.stringify({ message: "Use POST" }), {
    headers: corsHeaders,
  });
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const formData = await request.formData();
  const eventId = parseInt(formData.get("eventId"), 10);
  const name = formData.get("name");
  const email = formData.get("email");
  const tickets = parseInt(formData.get("tickets"), 10);

  if (!eventId || !name || !email || !tickets) {
    return new Response(
      JSON.stringify({ success: false, message: "All fields are required" }),
      { headers: corsHeaders }
    );
  }

  try {
    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return new Response(
        JSON.stringify({ success: false, message: "Event not found" }),
        { headers: corsHeaders }
      );
    }

    // Check ticket availability
    if (event.soldTickets + tickets > event.totalTickets) {
      return new Response(
        JSON.stringify({ success: false, message: "Not enough tickets available" }),
        { headers: corsHeaders }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: { eventId, name, email, tickets },
    });

    // Update sold tickets
    await prisma.event.update({
      where: { id: eventId },
      data: { soldTickets: { increment: tickets } },
    });

    return new Response(
      JSON.stringify({ success: true, booking }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to save booking" }),
      { headers: corsHeaders }
    );
  }
};