import mysql from "mysql2/promise";

let pool: mysql.Pool;

export async function getConnection() {
  if (!pool) {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT);
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT);
    const queueLimit = Number(process.env.DB_QUEUE_LIMIT);

    // Create the pool
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit,
      queueLimit,
    });
  }

  return pool.getConnection().catch((error) => {
    console.error("Error getting connection:", error);
    throw error;
  });
}
