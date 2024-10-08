import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getConnection } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET as string;
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  const { login, password } = await request.json();

  if (!login || !password) {
    return NextResponse.json(
      { msg: "Please enter both fields" },
      { status: 400 }
    );
  }

  // Periksa API Key dari header (opsional, jika diperlukan)
  const requestApiKey = request.headers.get("X-API-KEY");
  if (requestApiKey !== API_KEY) {
    return NextResponse.json({ msg: "Invalid API key" }, { status: 403 });
  }

  try {
    const db = await getConnection();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [login, login]
    );
    if (rows.length === 0) {
      return NextResponse.json({ msg: "User not found" }, { status: 400 });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ msg: "Invalid credentials" }, { status: 400 });
    }

    const token = jwt.sign({ uuid: user.uuid }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("Error during login:", err);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
