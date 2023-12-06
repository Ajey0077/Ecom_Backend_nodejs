const { Router } = require("express");

const router = Router();

module.exports = (pool) => {
  // const resetSequence = async () => {
  //   const resetSequenceQuery = `
  //     SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
  //   `;
  //   await pool.query(resetSequenceQuery);
  // };

  // Fetch products with pagination and search
  router.get("/", async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        searchText = "",
        filter = "all",
      } = req.query;

      const page_limit = limit || 10;
      const page_number = parseInt(page);

      if (page_number <= 0) {
        return res.status(400).json({ error: "Invalid page number provided" });
      }

      const skip_count = page_limit * (page_number - 1);

      let totalCountQuery;
      let fetchProductsQuery;
      let values;
      const filter_key = filter.toLowerCase();

      if (!filter || filter_key === "all") {
        totalCountQuery =
          "SELECT COUNT(*) FROM products WHERE LOWER(id::TEXT || title || category::TEXT) LIKE $1";
        fetchProductsQuery = `
          SELECT * FROM products
          WHERE LOWER(id::TEXT || title || category || description || price::TEXT || discount_percentage::TEXT || rating::TEXT || brand || category) LIKE $1
          ORDER BY id
          LIMIT $2 OFFSET $3;
        `;
        values = [`%${searchText.toLowerCase()}%`, page_limit, skip_count];
      } else {
        // Validate filter to prevent SQL injection
        const allowedFilters = [
          "id",
          "title",
          "description",
          "price",
          "discount_percentage",
          "rating",
          "brand",
          "category",
        ];
        const isValidFilter = allowedFilters.includes(filter_key);

        if (!isValidFilter) {
          return res.status(400).json({ error: "Invalid filter provided" });
        }

        totalCountQuery = `SELECT COUNT(*) FROM products WHERE ${filter_key}::TEXT LIKE $1`;
        fetchProductsQuery = `
          SELECT * FROM products
          WHERE ${filter_key}::TEXT LIKE $1
          ORDER BY id
          LIMIT $2 OFFSET $3;
        `;
        values = [`%${searchText.toLowerCase()}%`, page_limit, skip_count];
      }

      const totalCountResult = await pool.query(
        totalCountQuery,
        values.slice(0, 1)
      );
      const totalCount = parseInt(totalCountResult.rows[0].count);

      const total_pages = Math.ceil(totalCount / page_limit);

      if (page_number > total_pages && total_pages !== 0) {
        return res.status(400).json({ error: "Invalid page number provided" });
      }

      const { rows } = await pool.query(fetchProductsQuery, values);

      res.json({
        products: rows,
        total: totalCount,
        pageSize: parseInt(page_limit),
        skip: parseInt(skip_count),
        page: page_number,
        totalPages: total_pages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const selectProductQuery = "SELECT * FROM products WHERE id = $1";

      const { rows } = await pool.query(selectProductQuery, [productId]);

      if (rows[0]) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Add a new product
  router.post("/add", async (req, res) => {
    try {
      const {
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
      } = req.body;

      // Note: Don't include 'id' in the insert query for SERIAL type columns

      // Convert the images array to a JSON string
      const imagesJsonString = JSON.stringify(images);

      const insertProductQuery = `
        INSERT INTO products (
          title, description, price, discount_percentage, rating, stock,
          brand, category, thumbnail, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const values = [
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

      // await resetSequence();
      const result = await pool.query(insertProductQuery, values);

      res
        .status(201)
        .json({ id: result.rows[0].id, message: "Product added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Delete a product by ID
  router.delete("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const deleteProductQuery = "DELETE FROM products WHERE id = $1";
      await pool.query(deleteProductQuery, [productId]);
      // await resetSequence();

      res.json({
        message: `Product with ID ${productId} deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
};
