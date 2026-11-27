// Today's date in the user's own time zone, as YYYY-MM-DD (matches stored dates).
export function todayIso(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
