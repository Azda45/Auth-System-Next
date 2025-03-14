import mysql from "mysql2/promise";

let connection: any = null;

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.HOST,
      user: process.env.USER,
      password: process.env.PASS,
      database: process.env.DB,
    });
  }
  return connection;
}
