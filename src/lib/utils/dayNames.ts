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
  Kamis: "Kamis",
  Jumat: "Jumat",
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
  return ["Isnin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];
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
