export const BIDANG_ILMU_OPTIONS = [
  "Aqidah",
  "Fiqih",
  "Akhlak",
  "Hadis",
  "Tafsir",
  "Tasawuf",
  "Tahlil",
  "Ceramah Perdana",
] as const;

export type BidangIlmuOption = (typeof BIDANG_ILMU_OPTIONS)[number];
