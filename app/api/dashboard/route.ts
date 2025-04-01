import { NextResponse } from 'next/server';
import { any, z } from 'zod';
import type { ProductPost } from '../../../database/products';
import {
  createProductInsecure,
  getProductsInsecure,
  type Product,
} from '../../../database/products';

type ProductResponseBodyGet = {
  products: Product[];
};

export type ProductResponseBodyPost =
  | {
      product: ProductPost;
    }
  | { error: string };

// Zod schema for serverside input validation - PUT - update single product
export const productSchema = z.object({
  productName: z.string().min(1),
  productColor: z.string().min(1),
  pricePurchase: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
  priceRetail: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
  unitsPlanMonth: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
  yearlyTotals: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
  months: z.preprocess((val) => parseFloat(val as string), z.number().min(0)),
  years: z.preprocess((val) => parseFloat(val as string), z.number().min(0)),
});

// Zod schema for serverside input validation - POST - create single product
export const productSchemaPost = z.object({
  productName: z.string().min(1),
  productColor: z.string().min(1),
  pricePurchasePost: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
  priceRetailPost: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(0),
  ),
});

// Zod schema for serverside input validation - PUT - update single product
export const productSchemaPut = z.object({
  // priceRetail: z.number().optional(),
  priceRetail: z.record(z.any()),
  unitsPlanMonth: z.record(z.any()),
  yearlyTotals: z.record(z.any()),
});

// export const productSchemaPut = z.object(

// priceRetail: z.preprocess(
//   (val) => parseFloat(val as string),
//   z.number().min(0),
// ),
// unitsPlanMonth: z.preprocess(
//   (val) => parseFloat(val as string),
//   z.number().min(0),
// ),
// yearlyTotals: z.preprocess(
//   (val) => parseFloat(val as string),
//   z.number().min(0),
// ),
// );

// Not necessary - GET requests always with server-component directly
// GET - API - Define response object 'NextResponse'

export async function GET(): Promise<NextResponse<ProductResponseBodyGet>> {
  const products = await getProductsInsecure();
  return NextResponse.json({ products: products });
}

// POST - API - Define response object 'NextResponse'
export async function POST(
  request: Request,
): Promise<NextResponse<ProductResponseBodyPost>> {
  // Get request
  const requestBody = await request.json();

  console.log('request data', requestBody);

  // Check request
  const result = productSchemaPost.safeParse(requestBody);
  console.log('result', result);
  console.log('result data', result.data);

  // Check if the result was valid
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Safe Parse - Invalid request data',
      },
      { status: 400 },
    );
  }

  console.log('request data', result.data);

  // If success, define and send response object
  const newProduct = await createProductInsecure({
    productName: result.data.productName,
    productColor: result.data.productColor,
    pricePurchase: result.data.pricePurchasePost,
    priceRetail: result.data.priceRetailPost,
  });

  if (!newProduct) {
    return NextResponse.json(
      {
        error: 'Error',
      },
      { status: 500 },
    );
  }

  console.log('return value', newProduct);

  return NextResponse.json({ product: newProduct });
}
