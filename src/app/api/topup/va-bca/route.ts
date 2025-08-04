import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import midtransClient from "midtrans-client";
import { getConnection } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type TopUpRequest = {
  uid: string;
  coins: number;
};

type UserRow = {
  uuid: string;
  username: string;
  email: string;
} & RowDataPacket;
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: Request) {
  try {
    const { uid, coins }: TopUpRequest = await req.json();

    if (!uid || !coins || coins < 1) {
      return NextResponse.json(
        { error: "UID dan jumlah koin (min. 1) diperlukan" },
        { status: 400 }
      );
    }

    const amount = coins * 1000;

    const conn = await getConnection();
    const [rows] = await conn.execute<UserRow[]>(
      "SELECT uuid, username, email FROM users WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const user = rows[0];
    const orderId = `BCA-${uuidv4()}`;

    const transaction = await core.charge({
      payment_type: "bank_transfer",
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      bank_transfer: {
        bank: "bca",
      },
      customer_details: {
        first_name: user.username,
        email: user.email,
      },
      metadata: {
        uuid: user.uuid,
        coins_to_add: coins,
      },
    });

    const vaNumber =
      transaction.va_numbers?.find((va: any) => va.bank === "bca")?.va_number;

    if (!vaNumber) {
      throw new Error("Nomor VA BCA tidak tersedia");
    }

    return NextResponse.json({
      status: "pending",
      va_number: vaNumber,
      order_id: orderId,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json(
      { error: "Gagal membuat BCA VA: " + err.message },
      { status: 500 }
    );
  }
}
