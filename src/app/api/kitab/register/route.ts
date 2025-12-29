import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { judul, pengarang, bidang_ilmu, mazhab } = body || {};
    if (!judul || !pengarang || !bidang_ilmu || !mazhab) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Simulate DB save
    const created = { id: Date.now(), judul, pengarang, bidang_ilmu, mazhab, status: "pending", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    return NextResponse.json({
      success: true,
      message: "Kitab diterima, menunggu approval",
      data: created,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }
}
