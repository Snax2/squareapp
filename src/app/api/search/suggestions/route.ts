import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSearchSuggestions } from '@/lib/utils';

const suggestionsSchema = z.object({
  query: z.string().max(50),
  limit: z.coerce.number().min(1).max(10).default(5),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      query: searchParams.get('query') || '',
      limit: searchParams.get('limit'),
    };

    const validatedParams = suggestionsSchema.parse(params);
    
    const suggestions = generateSearchSuggestions(validatedParams.query)
      .slice(0, validatedParams.limit);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error) {
    console.error('Suggestions API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Invalid parameters',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUGGESTIONS_ERROR',
          message: 'Failed to get suggestions',
        },
      },
      { status: 500 }
    );
  }
}

