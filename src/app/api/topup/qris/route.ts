import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import midtransClient from "midtrans-client";
import { getConnection } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type TopUpRequest = {
  uid: string;
  coins: number; // jumlah koin dari FE
};

type UserRow = {
  uuid: string;
  username: string;
  email: string;
} & RowDataPacket;

type MidtransAction = {
  name: string;
  url: string;
};

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
    const orderId = `QRIS-${uuidv4()}`;

    const transaction = await core.charge({
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      qris: {
        acquirer: "gopay",
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

    const qrAction = transaction.actions?.find(
      (action: MidtransAction) => action.name === "generate-qr-code"
    );

    if (!qrAction?.url) {
      throw new Error("QRIS tidak tersedia");
    }

    return NextResponse.json({
      status: "pending",
      qr_code: qrAction.url,
      order_id: orderId,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json(
      { error: "Gagal membuat QRIS: " + err.message },
      { status: 500 }
    );
  }
}
