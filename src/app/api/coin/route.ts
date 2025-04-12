import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

const API_KEY = process.env.API_KEY as string;

// GET: Ambil saldo koin user berdasarkan UUID
export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== API_KEY) {
    return NextResponse.json(
      { status: 401, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json(
      { status: 400, msg: "User UUID is required" },
      { status: 400 }
    );
  }

  try {
    const pool = await getConnection();
    const [rows]: any = await pool.query(
      "SELECT coins FROM coins WHERE uuid = ?",
      [uuid]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 404, msg: "User not found" },
        { status: 404 }
      );
    }

    const { coins } = rows[0];
    return NextResponse.json({ status: 200, coins }, { status: 200 });
  } catch (err) {
    console.error("Error fetching coins:", err);
    return NextResponse.json(
      { status: 500, msg: "Server error" },
      { status: 500 }
    );
  }
}
