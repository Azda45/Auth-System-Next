import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60000); // 2 menit

    const pool = await getConnection();

    const [users]: any = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 404 }
      );
    }

    await pool.query(
      `INSERT INTO otps (email, code, expires_at, used)
       VALUES (?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at), used = 0`,
      [email, otp, expiresAt]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Otp Request",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #4CAF50;">Your OTP Code</h2>
          <p style="font-size: 18px; text-align: center; color: #333;">Here is your One-Time Password (OTP):</p>
          <h3 style="text-align: center; color: #4CAF50; font-size: 30px; font-weight: bold; letter-spacing: 2px;">${otp}</h3>
          <p style="font-size: 16px; text-align: center; color: #555;">
            This OTP code is valid for <strong style="color: #f44336;">2 minutes</strong>. Please use it before it expires.
          </p>
          <hr style="border: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="font-size: 14px; text-align: center; color: #888;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
