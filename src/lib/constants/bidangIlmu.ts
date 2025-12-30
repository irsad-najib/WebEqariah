export const BIDANG_ILMU_OPTIONS = [
  "Aqidah",
  "Fiqih",
  "Akhlak",
  "Hadis",
  "Tafsir",
  "Tasawuf",
] as const;

export type BidangIlmuOption = (typeof BIDANG_ILMU_OPTIONS)[number];
