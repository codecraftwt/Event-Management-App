import { useParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { PrismaClient} from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import "./styles/eventDetail.css";

const prisma = new PrismaClient();

// Loader fetches data from DB
export const loader = async () => {
  const events = await prisma.event.findMany({
    orderBy: { id: "asc" }, 
  });
  return json(events);
};


// const eventsData = [
//   {
//     id: 1,
//     title: "Music Concert",
//     date: new Date(2025, 8, 23),
//     time: "7:00 PM - 10:00 PM",
//     tag: "Music",
//     place: "City Hall, Downtown",
//     image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
//     description: "An amazing live music concert featuring top artists.",
//   },
//   {
//     id: 2,
//     title: "Workshop: React Basics",
//     date: new Date(2025, 8, 25),
//     time: "10:00 AM - 2:00 PM",
//     tag: "Education",
//     place: "Tech Park, Conference Room 3",
//     image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
//     description: "Hands-on workshop to learn the basics of React.js.",
//   },
//   {
//     id: 3,
//     title: "Online Webinar: AI Trends",
//     date: new Date(2025, 8, 27),
//     time: "5:00 PM - 6:30 PM",
//     tag: "Online",
//     place: "Zoom",
//     image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
//     description: "Join our AI expert to discuss the latest trends in AI.",
//   },
//   {
//     id: 4,
//     title: "Art Exhibition",
//     date: new Date(2025, 8, 29),
//     time: "11:00 AM - 5:00 PM",
//     tag: "Art",
//     place: "Gallery 21, Main Street",
//     image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
//     description: "Explore stunning artworks from local artists.",
//   },
//   {
//     id: 5,
//     title: "Charity Run",
//     date: new Date(2025, 8, 30),
//     time: "6:00 AM - 9:00 AM",
//     tag: "Sports",
//     place: "Central Park",
//     image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
//     description: "Join the charity run to support local communities.",
//   },
// ];

export default function EventDetail() {
  const { id } = useParams();
  const eventsData = useLoaderData();

  const event = eventsData.find((e) => e.id === Number(id));

  if (!event) return <p>Event not found</p>;

  return (
    <div className="event-container">
      <div className="event-card">
        <img className="event-image" src={event.image} alt={event.title} />
        <div className="event-content">
          <h1 className="event-title">{event.title}</h1>
          <p className="event-meta">
            <span>📅 {new Date(event.date).toDateString()}</span> • <span>⏰ {event.time}</span>
          </p>
          <p className="event-meta">📍 {event.place}</p>
          <p className="event-description">{event.description}</p>
          <span className="event-tag">{event.tag}</span>
        </div>
      </div>
    </div>
  );
}