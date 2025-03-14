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
    const db = await getConnection();
    const [rows] = await db.query("SELECT coins FROM coins WHERE uuid = ?", [
      uuid,
    ]);

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

// POST: Tambah saldo koin user
export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== API_KEY) {
    return NextResponse.json(
      { status: 401, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  const { uuid, coins } = await request.json();

  if (!uuid || coins == null) {
    return NextResponse.json(
      { status: 400, msg: "UUID and coin amount are required" },
      { status: 400 }
    );
  }

  try {
    const db = await getConnection();
    const [rows] = await db.query("SELECT coins FROM coins WHERE uuid = ?", [
      uuid,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 404, msg: "User not found" },
        { status: 404 }
      );
    }

    const updatedCoins = rows[0].coins + coins;

    await db.query("UPDATE coins SET coins = ? WHERE uuid = ?", [
      updatedCoins,
      uuid,
    ]);
    return NextResponse.json(
      { status: 200, msg: "Coins updated successfully", updatedCoins },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating coins:", err);
    return NextResponse.json(
      { status: 500, msg: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE: Kurangi saldo koin user
export async function DELETE(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== API_KEY) {
    return NextResponse.json(
      { status: 401, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  const { uuid, coins } = await request.json();

  if (!uuid || coins == null || coins <= 0) {
    return NextResponse.json(
      { status: 400, msg: "UUID and valid coin amount are required" },
      { status: 400 }
    );
  }

  try {
    const db = await getConnection();
    const [rows] = await db.query("SELECT coins FROM coins WHERE uuid = ?", [
      uuid,
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 404, msg: "User not found" },
        { status: 404 }
      );
    }

    const currentCoins = rows[0].coins;
    if (coins > currentCoins) {
      return NextResponse.json(
        { status: 400, msg: "Insufficient coins" },
        { status: 400 }
      );
    }

    const updatedCoins = currentCoins - coins;

    await db.query("UPDATE coins SET coins = ? WHERE uuid = ?", [
      updatedCoins,
      uuid,
    ]);
    return NextResponse.json(
      { status: 200, msg: "Coins deducted successfully", updatedCoins },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating coins:", err);
    return NextResponse.json(
      { status: 500, msg: "Server error" },
      { status: 500 }
    );
  }
}
