const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");

const router = express.Router();

const createTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  price NUMERIC,
  discount_percentage NUMERIC,
  rating NUMERIC,
  stock INTEGER,
  brand VARCHAR(255),
  category VARCHAR(255),
  thumbnail VARCHAR(255),
  images JSONB
);
`;

const insertDataRoute = (pool) => {
  router.post("/new", async (req, res) => {
    try {
      const { databaseName } = req.body;
      console.log(
        "🚀 ~ file: setup.js:11 ~ router.post ~ databaseName:",
        databaseName
      );

      if (1 || res.rowCount === 0) {
        console.log(`${databaseName} database not found, creating it.`);
        await pool.query(`CREATE DATABASE "${databaseName}";`);
        console.log(`created database ${databaseName}`);
        res
          .status(201)
          .json({ message: `Database "${databaseName}" created successfully` });
      } else {
        console.log(`${DB_NAME} database exists.`);
        res.status(500).json({ error: "database exists." });
      }
      // if (databaseExists.rows.length === 0) {
      //   // If the database does not exist, create it
      //   const createDatabaseQuery = `CREATE DATABASE ${databaseName}`;
      //   await pool.query(createDatabaseQuery);

      // } else {
      //   res
      //     .status(400)
      //     .json({ error: `Database "${databaseName}" already exists` });
      // }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/insert", async (req, res) => {
    const url = "https://dummyjson.com/products?limit=100";

    try {
      const response = await axios.get(url);
      const data = await response.data;

      // Create the 'products' table if it doesn't exist
      try {
        await pool.query(createTableQuery);
        console.log("Table 'products' created or already exists.");
      } catch (error) {
        console.error("Error creating table:", error);
      }

      for (const product of data.products) {
        const {
          id,
          title,
          description,
          price,
          discountPercentage,
          rating,
          stock,
          brand,
          category,
          thumbnail,
          images,
        } = product;

        const imagesJsonString = JSON.stringify(images);

        const query = `
          INSERT INTO products (
            id, title, description, price, discount_percentage, rating, stock,
            brand, category, thumbnail, images
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;

        const values = [
          id,
          title,
          description,
          price,
          discountPercentage,
          rating,
          stock,
          brand,
          category,
          thumbnail,
          imagesJsonString,
        ];

        await pool.query(query, values);
      }

      res.status(200).json({ message: "Data inserted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};

module.exports = insertDataRoute;
