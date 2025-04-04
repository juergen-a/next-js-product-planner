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
    const currentMonth = new Date().getMonth() + 1;

    const [product] = await sql<Product[]>`
      INSERT INTO
        products (
          product_name,
          product_color,
          price_purchase,
          price_retail,
          months
        )
      VALUES
        (
          ${newProduct.productName},
          ${newProduct.productColor},
          ${newProduct.pricePurchase},
          ${newProduct.priceRetail},
          ${currentMonth}
        )
      RETURNING
        id,
        product_name AS "productName",
        product_color AS "productColor",
        price_purchase::decimal AS "pricePurchase", -- Cast to decimal explicitly
        price_retail::decimal AS "priceRetail", -- Cast to decimal explicitly
        units_plan_month AS "unitsPlanMonth",
        yearly_totals::decimal AS "yearlyTotals", -- Cast to decimal explicitly
        months,
        years
    `;

    return product;
  },
);

export const updateProductInsecure = cache(async (updatedProduct: Product) => {
  console.log('updatedProduct', updatedProduct);

  // Extract priceRetail and unitsPlanMonth (both are now objects with months as inner keys)
  const priceRetail = updatedProduct.priceRetail;
  const unitsPlanMonth = updatedProduct.unitsPlanMonth;

  console.log('priceRetail', priceRetail);
  console.log('unitsPlanMonth', unitsPlanMonth);

  // Validate structures
  if (typeof priceRetail !== 'object' || priceRetail === null) {
    throw new Error('Invalid priceRetail structure');
  }

  if (typeof unitsPlanMonth !== 'object' || unitsPlanMonth === null) {
    throw new Error('Invalid unitsPlanMonth structure');
  }

  // Extract productId from the updatedProduct
  const productId = updatedProduct.id;

  console.log('ProductId---Put', productId);

  // Extract other product details (these will be the same across months if productId is the same)
  // const productName = updatedProduct.productName || 'Unknown product';
  // const productColor = updatedProduct.productColor || 'Unknown color';
  // const pricePurchase = updatedProduct.pricePurchase || 0;

  // Extract yearly total

  const yearlyTotal = Number(updatedProduct.yearlyTotals.value);
  if (isNaN(yearlyTotal)) {
    throw new Error(`Invalid yearly total value for product ${productId}`);
  }

  // Fetch the product from the database to get product_name, product_color, and price_purchase for this productId
  const existingProduct = await sql<Product[]>`
    SELECT
      id,
      product_name,
      product_color,
      price_purchase
    FROM
      products
    WHERE
      id = ${productId}
    LIMIT
      1
  `;

  if (existingProduct.length === 0) {
    throw new Error(`Product with id ${productId} does not exist`);
  }

  // Log the fetched product details
  console.log('Fetched product data:', existingProduct);

  // Extract product details, and handle missing values by assigning defaults
  const existingProductName =
    existingProduct[0].productName || 'Unknown product';
  const existingProductColor =
    existingProduct[0].productColor || 'Unknown color';
  const existingPricePurchase = !isNaN(Number(existingProduct[0].pricePurchase))
    ? Number(existingProduct[0].pricePurchase)
    : 0; // Default to 0 if price_purchase is invalid

  console.log('Retrieved product details:', {
    productName: existingProductName,
    productColor: existingProductColor,
    pricePurchase: existingPricePurchase,
  });

  const monthsArray = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
  };

  // Now we need to process the priceRetail and unitsPlanMonth for each month
  const monthUpdatePromises = Object.keys(monthsArray).map(async (month) => {
    console.log('Processing month:', month);

    const price = parseFloat(priceRetail[month]) || 0; // Price for the current month
    console.log('Type of price:', typeof price);
    console.log(
      `Checking price for product ${productId}, month ${month}:`,
      price,
    );

    if (isNaN(price)) {
      throw new Error(
        `Invalid price value for product ${productId}, month ${month}`,
      );
    }

    console.log('unitsPlanMonth for month', month, unitsPlanMonth[month]);

    const unitsForMonth = Number(unitsPlanMonth[month]) || 0; // Units for the current month
    console.log('Type of unitsForMonth:', typeof unitsForMonth);
    console.log(
      `Checking units for product ${productId}, month ${month}:`,
      unitsForMonth,
    );
    if (isNaN(unitsForMonth)) {
      throw new Error(
        `Invalid units value for product ${productId}, month ${month}`,
      );
    }

    // Step 1: Check if the product already exists in the database
    const existingMonthCheck = await sql<Product[]>`
      SELECT
        1
      FROM
        products
      WHERE
        id = ${productId}
        AND months = ${Number(month)}
      LIMIT
        1
    `;

    if (existingMonthCheck.length > 0) {
      // If the month exists, update the existing row
      console.log(
        `Month ${month} exists for product ${productId}, updating price and units.`,
      );
      await sql`
        UPDATE products
        SET
          price_retail = ${price},
          units_plan_month = ${unitsForMonth},
          yearly_totals = ${yearlyTotal}
        WHERE
          id = ${productId}
          AND months = ${Number(month)}
      `;
    } else {
      // If the month does not exist, insert a new row
      console.log(
        `Month ${month} does not exist for product ${productId}, creating new row.`,
      );

      await sql`
        -- Override the sequence for the id
        INSERT INTO
          products (
            id,
            product_name,
            product_color,
            price_purchase,
            months,
            price_retail,
            units_plan_month,
            yearly_totals
          )
        OVERRIDING SYSTEM VALUE
        VALUES
          (
            ${productId},
            -- product_name
            ${existingProductName}, -- product_name
            ${existingProductColor}, -- product_color
            ${existingPricePurchase}, -- price_purchase
            ${Number(month)}, -- months
            ${price}, -- price_retail (from your input data)
            ${unitsForMonth}, -- units_plan_month (from your input data)
            ${yearlyTotal} -- yearly_totals (from your input data)
          )
      `;
    }
  });

  // Await all month update promises
  await Promise.all(monthUpdatePromises);

  console.log(`Finished updating product ${productId}`);
});

//   const priceRetail = parseFloat(updatedProduct.priceRetail);
//   if (isNaN(priceRetail)) {
//     throw new Error('Invalid priceRetail value');
//   }

//   const [product] = await sql<Product[]>`
//     UPDATE products
//     SET
//       price_retail = ${priceRetail},
//       units_plan_month = ${updatedProduct.unitsPlanMonth},
//       yearly_totals = ${updatedProduct.yearlyTotals}
//     WHERE
//       id = ${updatedProduct.id}
//     RETURNING
//       products.*
//   `;

//   return product;
// });

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
