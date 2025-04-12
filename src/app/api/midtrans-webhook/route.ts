import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getConnection } from "@/lib/db";

type MidtransNotification = {
  order_id: string;
  transaction_status: string;
  gross_amount: string;
  metadata?: {
    uuid?: string;
    coins_to_add?: number;
  };
};

type TransactionStatus = "pending" | "success" | "failed";

// Midtrans Core API client
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: Request) {
  const conn = await getConnection();
  const connection = await conn.getConnection();

  try {
    const body = await req.json();
    const statusResponse = (await core.transaction.notification(
      body
    )) as MidtransNotification;

    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      gross_amount: amount,
      metadata,
    } = statusResponse;

    const userUuid = metadata?.uuid;
    const coinsToAdd = metadata?.coins_to_add;

    if (!userUuid || coinsToAdd === undefined) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    await connection.beginTransaction();

    let dbStatus: TransactionStatus = "pending";
    let shouldUpdateCoins = false;

    if (["capture", "settlement"].includes(transactionStatus)) {
      dbStatus = "success";
      shouldUpdateCoins = true;
    } else if (["deny", "expire", "cancel"].includes(transactionStatus)) {
      dbStatus = "failed";
    }

    if (shouldUpdateCoins) {
      await connection.execute(
        `
        INSERT INTO coins (uuid, coins, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          coins = coins + ?, 
          updated_at = NOW()
        `,
        [userUuid, coinsToAdd, coinsToAdd]
      );
    }

    await connection.execute(
      `
      INSERT INTO transactions (order_id, uuid, amount, coins, status)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
      `,
      [orderId, userUuid, amount, coinsToAdd, dbStatus]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      status: dbStatus,
      order_id: orderId,
      amount,
      coins_added: shouldUpdateCoins ? coinsToAdd : 0,
    });
  } catch (error: unknown) {
    await connection.rollback();
    const err = error instanceof Error ? error : new Error("Unknown error");
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Callback processing failed" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
