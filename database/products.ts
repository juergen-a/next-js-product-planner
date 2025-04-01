import { cache } from 'react';
// Has to imported in any file, where queries should run
import { sql } from '../database/connect';

export type ProductPost = {
  id: number;
  productName: string;
  productColor: string;
  pricePurchasePost: number;
  priceRetailPost: number;
  unitsPlanMonth: number;
  yearlyTotals: number;
  months: number;
  years: number;
};

export type Product = {
  id: number;
  productName: string;
  productColor: string;
  pricePurchase: number;
  priceRetail: number;
  unitsPlanMonth: number;
  yearlyTotals: number;
  months: number;
  years: number;
};
export type ProductUpdate = {
  priceRetail: any;
  unitsPlanMonth: any;
  yearlyTotals: any;
};
/*

  unitsPlanYear: number;
  valuePlanMonth: number;
  valuePlanYear: number;
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
  console.log('updatedProduct', updatedProduct);

  // Extract priceRetail (which is expected to be an object with month-value pairs)
  const priceRetail = updatedProduct.priceRetail;

  if (typeof priceRetail !== 'object' || priceRetail === null) {
    throw new Error('Invalid priceRetail structure');
  }

  // Extract product ID
  const productId = updatedProduct.id;

  // Dynamically build the SQL UPDATE queries for each month:value pair in priceRetail
  const monthUpdatePromises = Object.keys(priceRetail).map(
    async (productIdKey) => {
      const priceData = priceRetail[productIdKey];

      // Loop over each month for the given product and update the price_retail for each month
      const monthUpdatePromisesForProduct = Object.keys(priceData).map(
        async (month) => {
          const price = parseFloat(priceData[month]);
          if (isNaN(price)) {
            throw new Error(
              `Invalid priceRetail value for product ${productIdKey}, month ${month}`,
            );
          }
          const monthNumber = parseInt(month, 10);

          // Extract units for the given month
          const unitsForMonth = updatedProduct.unitsPlanMonth[monthNumber];

          console.log('unitsPlanMonth:', updatedProduct.unitsPlanMonth);

          if (unitsForMonth === undefined) {
            throw new Error(
              `No units plan available for product ${productIdKey}, month ${month}`,
            );
          }

          // Extract yearly totals if needed
          const yearlyTotal = updatedProduct.yearlyTotals.value;

          // Update the price_retail for the given productId and month
          const [updatedProductData] = await sql<Product[]>`
            UPDATE products
            SET
              price_retail = ${price}, -- Update price_retail for the month
              units_plan_month = ${unitsForMonth}, -- Correctly using units for the month
              yearly_totals = ${yearlyTotal} -- Using yearly totals value
            WHERE
              id = ${productId}
              AND months = ${month} -- Ensure we are updating the correct month for the product
            RETURNING
              products.*
          `;

          return updatedProductData;
        },
      );

      // Wait for all month updates to complete for the given productId
      return Promise.all(monthUpdatePromisesForProduct);
    },
  );

  // Wait for all product updates to complete
  const updatedProducts = await Promise.all(monthUpdatePromises);

  // Return the updated products (could be an array of products or just the updated product)
  return updatedProducts.flat(); // Flatten the array of arrays, if necessary
});

  const priceRetail = parseFloat(updatedProduct.priceRetail);
  if (isNaN(priceRetail)) {
    throw new Error('Invalid priceRetail value');
  }

  const [product] = await sql<Product[]>`
    UPDATE products
    SET
      price_retail = ${priceRetail},
      units_plan_month = ${updatedProduct.unitsPlanMonth},
      yearly_totals = ${updatedProduct.yearlyTotals}
    WHERE
      id = ${updatedProduct.id}
    RETURNING
      products.*
  `;

  // x = [m_1, ....., m_12];     month[x]

  return product;
});

// Delete product in database
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
