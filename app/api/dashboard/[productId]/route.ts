import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProductInsecure,
  type Product,
  updateProductInsecure,
} from '../../../../database/products';
import { productSchemaPut } from '../route';

export type ProductResponseBodyDelete =
  | {
      product: Product;
    }
  | { error: string };

export type ProductResponseBodyPut =
  | {
      product: Product;
    }
  | { error: string };

type ProductParams = {
  params: {
    productId: string;
  };
};

// DELETE - API - Define response object 'NextResponse'
export async function DELETE(
  request: NextRequest,
  { params }: ProductParams,
): Promise<NextResponse<ProductResponseBodyDelete>> {
  // Get request
  const product = await deleteProductInsecure({
    id: Number((await params).productId),
  });

  console.log('deleted product', product);

  if (!product) {
    return NextResponse.json(
      {
        error: 'Product does not exist',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ product: product });
}

// PUT - API - Define response object 'NextResponse'
export async function PUT(
  request: NextRequest,
  { params }: ProductParams,
): Promise<NextResponse<ProductResponseBodyPut>> {
  // Get request to update
  const requestBody = await request.json();

  console.log('Received update data:', requestBody);

  const result = productSchemaPut.safeParse(requestBody);

  console.log('resultZodPut -- 63', result);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Safe parsing with Zod of requestBody data failed',
        errorIssues: result.error.issues,
      },
      { status: 400 },
    );
  }
  console.log('params', await { params });

  const updatedProduct = await updateProductInsecure({
    id: Number((await params).productId),
    priceRetail: result.data.priceRetail,
    unitsPlanMonth: result.data.unitsPlanMonth || 0,
    yearlyTotals: result.data.yearlyTotals || 0,
  });

  if (!updatedProduct) {
    return NextResponse.json(
      { error: 'Updating of product within database failed' },
      { status: 500 },
    );
  }

  console.log('updatedProductPut', updatedProduct);

  return NextResponse.json({ product: updatedProduct });
}
