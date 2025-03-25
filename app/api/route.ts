import { NextResponse } from 'next/server';
import { z } from 'zod';

// Type for return object
export type RootResponseBodyGet =
  | {
      products: string;
    }
  | {
      error: string;
    };

// Zod schema for serverside input validation
const userSchema = z.object({
  name: z.string(),
});

// GET - API - Define response object 'NextResponse'
export function GET(): NextResponse<RootResponseBodyGet> {
  return NextResponse.json({ products: 'juergen' });
}

export async function POST(
  request: Request,
): Promise<NextResponse<RootResponseBodyGet>> {
  const requestBody = await request.json();

  const result = userSchema.safeParse(requestBody);

  if (!result.success) {
    return NextResponse.json({ error: 'Error' }, { status: 400 });
  }

  console.log('Zod result', result.data.name);
  return NextResponse.json({ products: 'juergen' });
}
