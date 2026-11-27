import ContentManager from "../components/ContentManager";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../api";
import { todayIso } from "../dates";

const api = { list: getEvents, create: createEvent, update: updateEvent, remove: deleteEvent };

const fields = [
  { name: "title", label: "Assessment / Event", maxLength: 120 },
  { name: "eventDate", label: "Date", type: "date" },
  { name: "startTime", label: "Time", type: "time" },
];

const initialValues = { title: "", eventDate: "", startTime: "" };

function AdminCalendar() {
  return (
    <ContentManager
      noun="Event"
      intro="Assessment calendar, shown to all students. Past dates drop off their dashboards."
      fields={fields}
      initialValues={initialValues}
      api={api}
      describe={(item) => ({
        heading: item.title,
        detail: `${item.day} · ${item.eventDate} · ${item.time}`,
        note: item.eventDate < todayIso() ? "Past" : null,
      })}
    />
  );
}

export default AdminCalendar;
