import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

const API_KEY = process.env.API_KEY as string;

// Handler untuk method GET
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
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const phonenumber = searchParams.get("phonenumber");

    const db = await getConnection();
    let query =
      "SELECT uuid, username, email, phonenumber FROM users WHERE 1=1";
    let params: string[] = [];

    // Tambahkan kondisi WHERE berdasarkan parameter yang diberikan
    if (uuid) {
      query += " AND uuid = ?";
      params.push(uuid);
    }

    if (username) {
      query += " AND username LIKE ?";
      params.push(`%${username}%`);
    }

    if (email) {
      query += " AND email LIKE ?";
      params.push(`%${email}%`);
    }

    if (phonenumber) {
      query += " AND phonenumber LIKE ?";
      params.push(`%${phonenumber}%`);
    }

    const [users] = await db.query(query, params);

    if (users.length === 0) {
      return NextResponse.json(
        { status: 404, msg: "User not found" },
        { status: 404 }
      );
    }

    // Jika hanya satu user ditemukan, gunakan key "user"
    if (users.length === 1) {
      return NextResponse.json(
        { status: 200, user: users[0] },
        { status: 200 }
      );
    }

    // Jika lebih dari satu user ditemukan, gunakan key "users"
    return NextResponse.json({ status: 200, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { status: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
