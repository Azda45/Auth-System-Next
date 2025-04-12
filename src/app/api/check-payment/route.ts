import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

type TransactionRow = {
  status: "pending" | "success" | "failed";
  amount: string;
  coins: number;
} & RowDataPacket;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const conn = await getConnection();
    const [rows] = await conn.execute<TransactionRow[]>(
      `
      SELECT status, amount, coins 
      FROM transactions 
      WHERE order_id = ?
      `,
      [orderId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ status: "pending" as const }, { status: 200 });
    }

    const trx = rows[0];

    return NextResponse.json({
      status: trx.status,
      order_id: orderId,
      amount: trx.amount,
      coins_added: trx.coins,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Check payment error:", err);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
