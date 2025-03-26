import { NextResponse } from 'next/server';
import { z } from 'zod';
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
      product: Product;
    }
  | { error: string };

// Zod schema for serverside input validation
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
  months: z.preprocess((val) => parseFloat(val as string), z.number().min(0)),
  years: z.preprocess((val) => parseFloat(val as string), z.number().min(0)),
});

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
  const result = productSchema.safeParse(requestBody);
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
    pricePurchase: result.data.pricePurchase,
    priceRetail: result.data.priceRetail,
    unitsPlanMonth: result.data.unitsPlanMonth || 0,
    months: result.data.months || 0,
    years: result.data.years || 0,
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
