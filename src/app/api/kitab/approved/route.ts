import { NextResponse } from "next/server";

export async function GET() {
  // Example data for local dev
  const sample = [
    {
      id: 1,
      judul: "Fiqhus Sunnah",
      pengarang: "As-Sayyid Sabiq",
      bidang_ilmu: "Fiqih",
      mazhab: "Syafi'i",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  return NextResponse.json({ success: true, data: sample });
}
