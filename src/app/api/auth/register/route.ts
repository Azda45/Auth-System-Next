import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const API_KEY = process.env.API_KEY;

async function generateUniqueUid(db: any): Promise<string> {
  while (true) {
    const uid = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    const [rows]: any = await db.query("SELECT uid FROM users WHERE uid = ?", [
      uid,
    ]);
    if (rows.length === 0) {
      return uid;
    }
  }
}

export async function POST(request: Request) {
  const { username, email, password } = await request.json();

  if (!username || !email || !password) {
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

    const [emailRows]: any = await db.query(
      "SELECT email FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (emailRows.length > 0) {
      return NextResponse.json(
        { msg: "Email already exists" },
        { status: 400 }
      );
    }

    const [usernameRows]: any = await db.query(
      "SELECT username FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (usernameRows.length > 0) {
      return NextResponse.json(
        { msg: "Username already exists" },
        { status: 400 }
      );
    }

    const uuid = uuidv4();
    const uid = await generateUniqueUid(db);

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      uuid,
      uid,
      username,
      email,
      password: hash,
    };

    await db.query("INSERT INTO users SET ?", newUser);
    await db.query("INSERT INTO coins (uuid, coins) VALUES (?, ?)", [
      newUser.uuid,
      0,
    ]);

    const token = jwt.sign({ uuid }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json({ token }, { status: 201 });
  } catch (err) {
    console.error("Error during registration:", err);
    return NextResponse.json({ msg: "Server error" }, { status: 500 });
  }
}
