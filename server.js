const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./dbConnect");
const { Pool } = require("pg");
const cors = require("cors");

dotenv.config();
// connectDB();

const app = express();

const PORT = process.env.PORT || 5000;
const DB_NAME = process.env.DB_NAME || "db123";
const DB_USER = process.env.DB_USER || "com211";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_PORT = process.env.DB_PORT || 5432;

const pool = new Pool({
  database: DB_NAME,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: 5432,
  connectionString: process.env.DBConfigLink,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(cors());
app.use(express.json());

app.use("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/db", require("./routes/setup")(pool));

app.use("/api/products", require("./routes/product")(pool));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
