// src/app/api/secure-account/route.ts
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // Validasi input
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token dan password baru diperlukan" },
        { status: 400 }
      );
    }

    // Validasi kompleksitas password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password harus minimal 8 karakter" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Gunakan transaksi database untuk operasi yang terkait
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
      const [tokenRows]: any = await connection.query(
        "SELECT * FROM secure_tokens WHERE token = ? AND used = 0",
        [token]
      );

      if (tokenRows.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: "Token tidak valid atau sudah digunakan" },
          { status: 400 }
        );
      }

      const tokenData = tokenRows[0];

      if (new Date(tokenData.expires_at) < new Date()) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: "Token sudah kedaluwarsa" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await connection.query(
        "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
        [hashedPassword, tokenData.email]
      );

      // Tandai token sebagai sudah digunakan
      await connection.query(
        "UPDATE secure_tokens SET used = 1 WHERE token = ?",
        [token]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: "Password berhasil diubah",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
