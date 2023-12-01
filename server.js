const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./dbConnect");
const { Pool } = require("pg");
const cors = require("cors");

dotenv.config();
// connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: "com211",
  host: "localhost",
  database: "db123",
  password: "asdfghjk",
  port: 5432,
});

app.use(cors());
app.use(express.json());

app.use("/api/db", require("./routes/setup")(pool));

app.use("/api/products", require("./routes/product")(pool));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
