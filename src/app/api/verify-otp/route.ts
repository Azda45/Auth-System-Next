import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    const [rows]: any = await pool.query(
      "SELECT * FROM otps WHERE email = ? AND code = ?",
      [email, otp]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "OTP not found" },
        { status: 400 }
      );
    }

    const otpData = rows[0];

    if (otpData.used === 1) {
      return NextResponse.json(
        { success: false, message: "OTP has already been used" },
        { status: 400 }
      );
    }

    if (new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
