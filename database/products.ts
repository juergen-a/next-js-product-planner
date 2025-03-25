import { cache } from 'react';
// Has to imported in any file, where queries should run
import { sql } from '../database/connect';

export type Product = {
  id: number;
  productName: string;
  productColor: string;
  pricePurchase: number;
  priceRetail: number;
};
/*
  unitsPlanMonth: number;
  unitsPlanYear: number;
  valuePlanMonth: number;
  valuePlanYear: number;
  month: number;
  year: number;
  user_id: number;*/

// Retrieve all products from DB
export const getProductsInsecure = cache(async () => {
  const products = await sql<Product[]>`
    SELECT
      *
    FROM
      products
  `;

  return products;
});

// Retrieve one product from DB, based on ID --> coming from 1) user input or 2) params from the URL
// Single product can be accessed via array destructuring, as the response object is always wrapped in an array
export const getProductInsecure = cache(async (id: number) => {
  const [product] = await sql<Product[]>`
    SELECT
      *
    FROM
      products
    WHERE
      id = ${id}
  `;

  return product;
});

// Create new product in database
export const createProductInsecure = cache(
  async (newProduct: Omit<Product, 'id'>) => {
    const [product] = await sql<Product[]>`
      INSERT INTO
        products (
          product_name,
          product_color,
          price_purchase,
          price_retail
        )
      VALUES
        (
          ${newProduct.productName},
          ${newProduct.productColor},
          ${newProduct.pricePurchase},
          ${newProduct.priceRetail}
        )
      RETURNING
        products.*
    `;

    return product;
  },
);

// Update new product in database
export const updateProductInsecure = cache(async (updatedProduct: Product) => {
  const [product] = await sql<Product[]>`
    UPDATE products
    SET
      product_name = ${updatedProduct.productName},
      product_color = ${updatedProduct.productColor},
      price_purchase = ${updatedProduct.pricePurchase},
      price_retail = ${updatedProduct.priceRetail}
    WHERE
      id = ${updatedProduct.id}
    RETURNING
      products.*
  `;

  return product;
});

// Delete new product in database
export const deleteProductInsecure = cache(
  async (deletedProduct: Pick<Product, 'id'>) => {
    const [product] = await sql<Product[]>`
      DELETE FROM products
      WHERE
        id = ${deletedProduct.id}
      RETURNING
        products.*
    `;

    return product;
  },
);
