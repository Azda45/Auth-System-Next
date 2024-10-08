import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const API_KEY = process.env.API_KEY;

export async function POST(request: Request) {
  const { username, email, password, phonenumber } = await request.json();

  if (!username || !email || !password || !phonenumber) {
    return NextResponse.json(
      { msg: "Please enter all fields" },
      { status: 400 }
    );
  }

  // Periksa API Key dari header (opsional)
  const requestApiKey = request.headers.get("X-API-KEY");
  if (requestApiKey !== API_KEY) {
    return NextResponse.json({ msg: "Invalid API key" }, { status: 403 });
  }

  try {
    const db = await getConnection();

    // Check if email already exists
    const [emailRows] = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (emailRows.length > 0) {
      return NextResponse.json(
        { msg: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const [usernameRows] = await db.query(
      "SELECT username FROM users WHERE username = ?",
      [username]
    );
    if (usernameRows.length > 0) {
      return NextResponse.json(
        { msg: "Username already exists" },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const [phoneRows] = await db.query(
      "SELECT phonenumber FROM users WHERE phonenumber = ?",
      [phonenumber]
    );
    if (phoneRows.length > 0) {
      return NextResponse.json(
        { msg: "Phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password and store user in database
    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      uuid: uuidv4(),
      username,
      email,
      phonenumber,
      password: hash,
    };

    await db.query("INSERT INTO users SET ?", newUser);
    await db.query("INSERT INTO user_coins (uuid, coins) VALUES (?, ?)", [
      newUser.uuid,
      0,
    ]);

    // Generate token
    const token = jwt.sign({ uuid: newUser.uuid }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return NextResponse.json({ token }, { status: 201 });
  } catch (err) {
    console.error("Error during registration:", err);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
