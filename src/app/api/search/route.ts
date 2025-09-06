import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateDistance, BYRON_BAY_COORDS } from '@/lib/utils';
import type { SearchResponse, ProductWithMerchant } from '@/lib/types';

const searchSchema = z.object({
  query: z.string().min(1).max(100),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(50).default(10),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  inStock: z.coerce.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check if we're in build time (no DATABASE_URL)
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BUILD_TIME',
            message: 'API not available during build',
          },
        },
        { status: 503 }
      );
    }

    const { prisma } = await import('@/lib/database');
    const { searchParams } = new URL(request.url);
    const params = {
      query: searchParams.get('query'),
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
      limit: searchParams.get('limit'),
      category: searchParams.get('category'),
      inStock: searchParams.get('inStock'),
    };

    const validatedParams = searchSchema.parse(params);
    
    // Use provided coordinates or default to Byron Bay
    const userLat = validatedParams.lat ?? BYRON_BAY_COORDS.latitude;
    const userLng = validatedParams.lng ?? BYRON_BAY_COORDS.longitude;

    // Build where clause
    const whereClause: any = {
      isActive: true,
      merchant: {
        isActive: true,
      },
    };

    // Add text search
    if (validatedParams.query) {
      whereClause.OR = [
        {
          name: {
            contains: validatedParams.query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: validatedParams.query,
            mode: 'insensitive',
          },
        },
        {
          category: {
            contains: validatedParams.query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add category filter
    if (validatedParams.category) {
      whereClause.category = {
        contains: validatedParams.category,
        mode: 'insensitive',
      };
    }

    // Find products with inventory
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        merchant: true,
        variations: {
          include: {
            inventory: true,
          },
        },
      },
      take: validatedParams.limit * 2, // Get more to filter by distance and stock
    });

    // Filter by distance and calculate
    const productsWithDistance = products
      .map(product => {
        const distance = calculateDistance(
          userLat,
          userLng,
          product.merchant.latitude,
          product.merchant.longitude
        );

        // Skip if outside radius
        if (distance > validatedParams.radius) {
          return null;
        }

        // Calculate total stock
        const totalStock = product.variations.reduce(
          (sum, variation) => sum + (variation.inventory[0]?.quantity || 0),
          0
        );

        // Skip if no stock and inStock is required
        if (validatedParams.inStock && totalStock === 0) {
          return null;
        }

        // Transform to API format
        const transformedProduct: ProductWithMerchant = {
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          category: product.category || undefined,
          imageUrl: product.imageUrl || undefined,
          basePrice: product.basePrice || undefined,
          merchant: {
            id: product.merchant.id,
            name: product.merchant.name,
            address: product.merchant.address as any,
            latitude: product.merchant.latitude,
            longitude: product.merchant.longitude,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          },
          variations: product.variations.map(variation => ({
            id: variation.id,
            name: variation.name,
            price: variation.price,
            attributes: variation.attributes as Record<string, any>,
            inventory: {
              quantity: variation.inventory[0]?.quantity || 0,
              lastUpdated: variation.inventory[0]?.lastSyncAt.toISOString() || new Date().toISOString(),
            },
          })),
          totalStock,
        };

        return { product: transformedProduct, distance };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by distance, then by stock, then by name
        if (a!.distance !== b!.distance) {
          return a!.distance - b!.distance;
        }
        if (a!.product.totalStock !== b!.product.totalStock) {
          return b!.product.totalStock - a!.product.totalStock;
        }
        return a!.product.name.localeCompare(b!.product.name);
      })
      .slice(0, validatedParams.limit)
      .map(item => item!.product);

    // Log search for analytics
    await prisma.search.create({
      data: {
        query: validatedParams.query,
        latitude: userLat,
        longitude: userLng,
        radius: validatedParams.radius,
        results: productsWithDistance.length,
      },
    });

    const executionTime = Date.now() - startTime;

    const response: SearchResponse = {
      success: true,
      data: {
        products: productsWithDistance,
        pagination: {
          total: productsWithDistance.length,
          page: 1,
          limit: validatedParams.limit,
          hasMore: false, // TODO: Implement proper pagination
        },
        searchMeta: {
          query: validatedParams.query,
          location: {
            lat: userLat,
            lng: userLng,
          },
          radius: validatedParams.radius,
          executionTime,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMS',
            message: 'Invalid search parameters',
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
          code: 'SEARCH_ERROR',
          message: 'Failed to search products',
        },
      },
      { status: 500 }
    );
  }
}

