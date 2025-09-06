import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { squareAPI } from '@/lib/square-api';

export async function POST(request: NextRequest) {
  try {
    const { locationId } = await request.json();

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    console.log('Starting Square sync for location:', locationId);

    // Sync merchant data from Square
    const syncData = await squareAPI.syncMerchantData(locationId);
    const { location, products, inventory } = syncData;

    // Create or update merchant
    const merchant = await prisma.merchant.upsert({
      where: { squareMerchantId: location.id! },
      update: {
        name: location.name || 'Unnamed Store',
        email: location.businessEmail,
        phone: location.phoneNumber,
        address: {
          street: location.address?.addressLine1 || '',
          city: location.address?.locality || '',
          state: location.address?.administrativeDistrictLevel1 || '',
          postcode: location.address?.postalCode || '',
          country: location.address?.country || 'AU',
        },
        latitude: location.coordinates?.latitude || 0,
        longitude: location.coordinates?.longitude || 0,
        isActive: location.status === 'ACTIVE',
        updatedAt: new Date(),
      },
      create: {
        squareMerchantId: location.id!,
        name: location.name || 'Unnamed Store',
        email: location.businessEmail,
        phone: location.phoneNumber,
        address: {
          street: location.address?.addressLine1 || '',
          city: location.address?.locality || '',
          state: location.address?.administrativeDistrictLevel1 || '',
          postcode: location.address?.postalCode || '',
          country: location.address?.country || 'AU',
        },
        latitude: location.coordinates?.latitude || 0,
        longitude: location.coordinates?.longitude || 0,
        isActive: location.status === 'ACTIVE',
      },
    });

    console.log('Merchant synced:', merchant.name);

    let syncedProducts = 0;
    let syncedVariations = 0;
    let syncedInventory = 0;

    // Sync products and variations
    for (const squareProduct of products) {
      // Create or update product
      const product = await prisma.product.upsert({
        where: { squareItemId: squareProduct.id },
        update: {
          name: squareProduct.name,
          description: squareProduct.description,
          category: squareProduct.category,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          squareItemId: squareProduct.id,
          merchantId: merchant.id,
          name: squareProduct.name,
          description: squareProduct.description,
          category: squareProduct.category,
          isActive: true,
        },
      });

      syncedProducts++;

      // Sync variations
      for (const squareVariation of squareProduct.variations) {
        const variation = await prisma.productVariation.upsert({
          where: { squareVariationId: squareVariation.id },
          update: {
            name: squareVariation.name,
            price: squareVariation.price,
            sku: squareVariation.sku,
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            squareVariationId: squareVariation.id,
            productId: product.id,
            name: squareVariation.name,
            price: squareVariation.price,
            sku: squareVariation.sku,
            attributes: {}, // Will be enhanced with actual attributes later
            isActive: true,
          },
        });

        syncedVariations++;

        // Find inventory for this variation
        const inventoryData = inventory.find(inv => inv.variationId === squareVariation.id);
        
        if (inventoryData) {
          await prisma.inventory.upsert({
            where: {
              productId_variationId: {
                productId: product.id,
                variationId: variation.id,
              },
            },
            update: {
              quantity: inventoryData.quantity,
              lastSyncAt: new Date(),
            },
            create: {
              productId: product.id,
              variationId: variation.id,
              quantity: inventoryData.quantity,
              lastSyncAt: new Date(),
            },
          });

          syncedInventory++;
        }
      }
    }

    const result = {
      success: true,
      data: {
        merchant: {
          id: merchant.id,
          name: merchant.name,
        },
        synced: {
          products: syncedProducts,
          variations: syncedVariations,
          inventory: syncedInventory,
        },
        timestamp: new Date().toISOString(),
      },
    };

    console.log('Sync completed:', result.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Square sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: 'Failed to sync Square data',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

