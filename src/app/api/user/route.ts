import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

const API_KEY = process.env.API_KEY as string;

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== API_KEY) {
    return NextResponse.json(
      { status: 401, msg: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");
    const uid = searchParams.get("uid");
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    const pool = await getConnection();
    let query = "SELECT uid, username, email FROM users WHERE 1=1"; // uuid tidak disertakan di SELECT
    const params: string[] = [];

    if (uuid) {
      query += " AND uuid = ?";
      params.push(uuid);
    }

    if (uid) {
      query += " AND uid LIKE ?";
      params.push(`%${uid}%`);
    }

    if (username) {
      query += " AND username LIKE ?";
      params.push(`%${username}%`);
    }

    if (email) {
      query += " AND email LIKE ?";
      params.push(`%${email}%`);
    }

    const [users]: any = await pool.query(query, params);

    if (users.length === 0) {
      return NextResponse.json(
        { status: 404, msg: "User not found" },
        { status: 404 }
      );
    }

    if (users.length === 1) {
      return NextResponse.json(
        { status: 200, user: users[0] },
        { status: 200 }
      );
    }

    return NextResponse.json({ status: 200, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { status: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
