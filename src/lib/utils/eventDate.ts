import { formatDateIndonesian } from "./dayNames";

export function parseEventDate(eventDate: string | undefined | null) {
  if (!eventDate) return { date: "", time: "" };

  try {
    const dateObj = new Date(eventDate);
    return {
      date: formatDateIndonesian(dateObj), // Use centralized formatter
      time: dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: String(eventDate), time: "" };
  }
}
