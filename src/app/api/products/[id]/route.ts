import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { calculateDistance } from '@/lib/utils';
import type { ProductWithMerchant } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // Find product with all related data
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        merchant: true,
        variations: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    // Calculate distance if coordinates provided
    let distance: number | undefined;
    if (lat && lng) {
      distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        product.merchant.latitude,
        product.merchant.longitude
      );
    }

    // Calculate total stock
    const totalStock = product.variations.reduce(
      (sum, variation) => sum + (variation.inventory[0]?.quantity || 0),
      0
    );

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
        distance: distance ? Math.round(distance * 10) / 10 : undefined,
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

    return NextResponse.json({
      success: true,
      data: {
        product: transformedProduct,
      },
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PRODUCT_ERROR',
          message: 'Failed to retrieve product',
        },
      },
      { status: 500 }
    );
  }
}

