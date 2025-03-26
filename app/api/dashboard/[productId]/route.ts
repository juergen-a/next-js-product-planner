import { NextRequest, NextResponse } from 'next/server';
import {
  deleteProductInsecure,
  type Product,
  updateProductInsecure,
} from '../../../../database/products';
import { productSchema } from '../route';

type ProductResponseBodyDelete =
  | {
      product: Product;
    }
  | { error: string };

type ProductResponseBodyPut =
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

  const result = productSchema.safeParse(requestBody);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Request does not contain product to delete',
        errorIssues: result.error.issues,
      },
      { status: 400 },
    );
  }

  const updatedProduct = await updateProductInsecure({
    id: Number((await params).productId),
    productName: result.data.productName,
    productColor: result.data.productColor,
    pricePurchase: result.data.pricePurchase,
    priceRetail: result.data.priceRetail,
    unitsPlanMonth: result.data.unitsPlanMonth || 0,
    months: result.data.months || 0,
    years: result.data.years || 0,
  });

  if (!updatedProduct) {
    return NextResponse.json(
      { error: 'Access denied updating product' },
      { status: 500 },
    );
  }

  return NextResponse.json({ product: updatedProduct });
}
