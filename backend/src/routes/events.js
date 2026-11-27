import { contentRouter, checkText } from "../contentRouter.js";
import { isIsoDate, isTime } from "../academics.js";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// "14:05" -> "2:05 PM"
function displayTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export default contentRouter({
  file: "events",
  label: "Event",
  fields: ["title", "eventDate", "startTime"],
  validate(values) {
    const textError = checkText(values, [["title", "Title", 120]]);
    if (textError) return textError;
    if (!isIsoDate(values.eventDate)) return "Select a valid date.";
    if (!isTime(values.startTime)) return "Select a valid time (HH:MM).";
    return null;
  },
  // Soonest first.
  compare: (a, b) =>
    a.eventDate.localeCompare(b.eventDate) || a.startTime.localeCompare(b.startTime),
  // day / date / month / time are what the dashboard tiles display.
  toResponse: ({ id, title, eventDate, startTime }) => {
    const date = new Date(`${eventDate}T00:00:00Z`);
    return {
      id,
      title,
      eventDate,
      startTime,
      day: DAYS[date.getUTCDay()],
      date: String(date.getUTCDate()),
      month: MONTHS[date.getUTCMonth()],
      time: displayTime(startTime),
    };
  },
});
