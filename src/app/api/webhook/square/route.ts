import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { squareAPI } from '@/lib/square-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature') || '';
    const url = request.url;

    // Verify webhook signature
    const isValid = squareAPI.verifyWebhookSignature(body, signature, url);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    const { type, data } = webhookData;

    console.log('Received Square webhook:', type);

    switch (type) {
      case 'inventory.count.updated':
        await handleInventoryUpdate(data);
        break;
      
      case 'catalog.version.updated':
        await handleCatalogUpdate(data);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleInventoryUpdate(data: any) {
  try {
    const { location_id, inventory_counts } = data;

    if (!inventory_counts || !Array.isArray(inventory_counts)) {
      return;
    }

    for (const count of inventory_counts) {
      const { catalog_object_id, quantity } = count;

      // Find the variation in our database
      const variation = await prisma.productVariation.findUnique({
        where: { squareVariationId: catalog_object_id },
        include: { product: true },
      });

      if (variation) {
        // Update inventory
        await prisma.inventory.upsert({
          where: {
            productId_variationId: {
              productId: variation.productId,
              variationId: variation.id,
            },
          },
          update: {
            quantity: parseInt(quantity) || 0,
            lastSyncAt: new Date(),
          },
          create: {
            productId: variation.productId,
            variationId: variation.id,
            quantity: parseInt(quantity) || 0,
            lastSyncAt: new Date(),
          },
        });

        console.log(`Updated inventory for ${variation.name}: ${quantity}`);
      }
    }
  } catch (error) {
    console.error('Inventory update error:', error);
    throw error;
  }
}

async function handleCatalogUpdate(data: any) {
  try {
    const { location_id } = data;

    // This is a more complex operation that would require
    // re-syncing the entire catalog for the location
    console.log('Catalog update received for location:', location_id);
    
    // For now, we'll just log it. In a production system,
    // you might want to queue a full catalog sync job
    // or implement incremental updates based on the specific changes
  } catch (error) {
    console.error('Catalog update error:', error);
    throw error;
  }
}

