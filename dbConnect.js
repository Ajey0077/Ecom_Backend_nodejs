const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const DB_NAME = process.env.DB_NAME || "db123";
const DB_USER = process.env.DB_USER || "com211";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";

const connectDB = async () => {
  const client = new Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: 5432,
  });
  console.log("connect :", DB_NAME);

  try {
    await client.connect();
    console.log("DB_NAME:", DB_NAME);

    console.log("🚀 ~ file: dbConnect.js:24 ~ connectAndCreateDatabase ~ res:");
    const res = await client.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${DB_NAME}'`
    );
    console.log(
      "🚀 ~ file: dbConnect.js:25 ~ connectAndCreateDatabase ~ res:",
      res
    );

    if (res.rowCount === 0) {
      console.log(`${DB_NAME} database not found, creating it.`);
      await client.query(`CREATE DATABASE "${DB_NAME}";`);
      console.log(`created database ${DB_NAME}`);
    } else {
      console.log(`${DB_NAME} database exists.`);
    }
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    await client.end();
  }
};

module.exports = connectDB;
