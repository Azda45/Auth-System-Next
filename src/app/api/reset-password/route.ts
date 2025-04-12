// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid API Key" },
      { status: 401 }
    );
  }

  const { email, otp, newPassword } = await req.json();

  try {
    const pool = await getConnection();

    // Cek OTP
    const [otpRows]: any = await pool.query(
      "SELECT * FROM otps WHERE email = ? AND code = ?",
      [email, otp]
    );

    if (otpRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "OTP not found" },
        { status: 400 }
      );
    }

    const otpData = otpRows[0];

    if (new Date(otpData.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    if (otpData.used === 1) {
      return NextResponse.json(
        { success: false, message: "OTP has already been used" },
        { status: 400 }
      );
    }

    // Ambil Username
    const [userRows]: any = await pool.query(
      "SELECT username FROM users WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const username = userRows[0].username;

    // Hash Password Baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
      [hashedPassword, email]
    );

    await pool.query("UPDATE otps SET used = 1 WHERE email = ? AND code = ?", [
      email,
      otp,
    ]);

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

    // Simpan token
    await pool.query(
      "INSERT INTO secure_tokens (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expiresAt]
    );

    const link = process.env.APP_URL + `/secure-account/${token}`;

    // Format Waktu Reset
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Kirim Email Notifikasi
    await sendEmail({
      to: email,
      subject: "Password successfully changed",
      html: `
<div class="max-w-[600px] mx-auto my-5 bg-white rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,167,255,0.1)] border border-gray-200 text-[#2d3748] font-[Rajdhani,sans-serif]">
  <div class="bg-gradient-to-br from-[#00a6ff] to-[#7d4fff] p-5 text-center text-white relative overflow-hidden">
    <h2 class="text-[28px] font-bold uppercase tracking-[2px] font-[Orbitron,sans-serif] drop-shadow-[0_0_10px_rgba(0,167,255,0.3)] m-0">
      PASSWORD UPDATED
    </h2>
  </div>

  <div class="p-8">
    <p>Hi <strong class="text-[#00a6ff] drop-shadow-[0_0_8px_rgba(0,167,255,0.2)]">${username}</strong>,</p>
    <p>Your password was successfully updated on <strong>${formattedDate}</strong> at <strong>${formattedTime}</strong>.</p>

    <div class="bg-[rgba(0,167,255,0.05)] p-5 rounded-xl my-6 border-l-4 border-[#00a6ff]">
      <p>If this wasn't you, secure your account now:</p>
      <div class="text-center mt-4">
        <a href="${link}" class="inline-block px-7 py-3 bg-gradient-to-br from-[#00a6ff] to-[#7d4fff] text-white no-underline rounded-full font-semibold tracking-wider shadow-[0_0_15px_rgba(0,167,255,0.2)] hover:shadow-[0_0_25px_rgba(0,167,255,0.3)]">
          SECURE ACCOUNT
        </a>
      </div>
    </div>

    <p class="text-center">Need help? <a href="mailto:support@yourbrand.com" class="text-[#00a6ff] no-underline">Contact Support</a></p>
  </div>

  <div class="p-5 text-center text-xs text-gray-500 border-t border-gray-200">
    <p>© 2023 <span class="text-[#00a6ff] drop-shadow-[0_0_8px_rgba(0,167,255,0.2)]">MatyrNetwork</span>. All rights reserved.</p>
  </div>
</div>

      `,
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
