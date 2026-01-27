/**
 * Day Name Mapping Utility
 *
 * Maps Indonesian day names to their Malay equivalents
 * as used in the application.
 */

const DAY_MAPPING: Record<string, string> = {
  Senin: "Isnin",
  Selasa: "Selasa",
  Rabu: "Rabu",
  Kamis: "Khamis",
  Jumat: "Jumaat",
  Sabtu: "Sabtu",
  Minggu: "Ahad",
};

/**
 * Maps an Indonesian day name to its Malay equivalent
 * @param day - Indonesian day name (e.g., "Senin", "Minggu")
 * @returns Malay day name (e.g., "Isnin", "Ahad")
 */
export function mapDayName(day: string): string {
  return DAY_MAPPING[day] || day;
}

/**
 * Get all day names in Malay (ordered from Monday to Sunday)
 */
export function getAllMalayDayNames(): string[] {
  return ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
}

/**
 * Get day name from Date object in Malay
 * @param date - JavaScript Date object
 * @returns Malay day name
 */
export function getDayNameFromDate(date: Date): string {
  const indonesianDays = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const dayIndex = date.getDay();
  const indonesianDay = indonesianDays[dayIndex];
  return mapDayName(indonesianDay);
}

/**
 * Formats a date to Indonesian/Malay locale string with corrected day names
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., "Isnin, 27 Januari 2026")
 */
export function formatDateIndonesian(
  date: Date | string | null | undefined,
): string {
  if (!date) return "-";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  // Use id-ID locale for basic formatting
  const formatted = d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Replace day names with Malay equivalents
  // We can just replace the first word since "Senin, ..." is the typical format
  const parts = formatted.split(",");
  if (parts.length > 0) {
    const dayName = parts[0].trim();
    parts[0] = mapDayName(dayName);
    return parts.join(",");
  }

  // Fallback if format is unexpected, just try replacing known keys
  let result = formatted;
  for (const [indo, malay] of Object.entries(DAY_MAPPING)) {
    if (result.includes(indo)) {
      result = result.replace(indo, malay);
      break; // Usually only one day name per string
    }
  }

  return result;
}
