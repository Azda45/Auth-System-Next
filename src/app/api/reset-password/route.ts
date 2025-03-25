// /src/app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  // Ambil API Key dari header x-api-key
  const apiKey = req.headers.get("x-api-key");

  // Periksa apakah API Key valid
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid API Key" },
      { status: 401 }
    );
  }

  const { email, otp, newPassword } = await req.json();

  const conn = await getConnection();

  // Cek apakah OTP ada dan sesuai
  const [otpRows]: any = await conn.execute(
    "SELECT * FROM otps WHERE email = ? AND code = ?",
    [email, otp]
  );

  if (otpRows.length === 0) {
    return NextResponse.json(
      { success: false, message: "OTP not found" },
      { status: 400 }
    );
  }

  // Cek apakah OTP sudah kadaluarsa
  const otpData = otpRows[0];
  if (new Date(otpData.expires_at) < new Date()) {
    return NextResponse.json(
      { success: false, message: "OTP has expired" },
      { status: 400 }
    );
  }

  // Cek apakah OTP sudah digunakan
  if (otpData.used === 1) {
    return NextResponse.json(
      { success: false, message: "OTP has already been used" },
      { status: 400 }
    );
  }

  // Hash password baru
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password pengguna
  await conn.execute("UPDATE users SET password = ? WHERE email = ?", [
    hashedPassword,
    email,
  ]);

  // Tandai OTP sebagai sudah digunakan
  await conn.execute("UPDATE otps SET used = 1 WHERE email = ?", [email]);

  return NextResponse.json({
    success: true,
    message: "Password changed successfully",
  });
}
