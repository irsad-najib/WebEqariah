export function parseEventDate(eventDate: string | undefined | null) {
  if (!eventDate) return { date: "", time: "" };

  try {
    const dateObj = new Date(eventDate);
    return {
      date: dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      time: dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return { date: String(eventDate), time: "" };
  }
}
