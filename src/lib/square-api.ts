import { Client, Environment } from 'square';
import type { SquareProduct, SquareVariation, SquareInventory } from './types';

export class SquareAPIClient {
  private client: Client | null = null;

  private getClient(): Client {
    if (!this.client) {
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      const environment = process.env.SQUARE_ENVIRONMENT;

      if (!accessToken) {
        throw new Error('SQUARE_ACCESS_TOKEN environment variable is required');
      }

      this.client = new Client({
        accessToken,
        environment: environment === 'production' ? Environment.Production : Environment.Sandbox,
      });
    }
    return this.client;
  }

  async searchCatalog(query: string, locationId?: string): Promise<SquareProduct[]> {
    try {
      // For now, get all items and filter client-side
      // This can be optimized later with proper text search
      const response = await this.getClient().catalogApi.listCatalog(undefined, 'ITEM');

      const items = response.result.objects || [];
      
      // Get variations separately
      const variationsResponse = await this.getClient().catalogApi.listCatalog(undefined, 'ITEM_VARIATION');
      const variations = variationsResponse.result.objects || [];

      // Filter items by query
      const filteredItems = items.filter(item => {
        const name = item.itemData?.name?.toLowerCase() || '';
        const description = item.itemData?.description?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        return name.includes(queryLower) || description.includes(queryLower);
      });

      return filteredItems.map(item => {
        const itemVariations = variations
          .filter(obj => obj.type === 'ITEM_VARIATION' && obj.itemVariationData?.itemId === item.id)
          .map(variation => ({
            id: variation.id!,
            name: variation.itemVariationData?.name || 'Default',
            price: Number(variation.itemVariationData?.priceMoney?.amount || 0) / 100, // Convert cents to dollars
            sku: variation.itemVariationData?.sku || undefined,
          }));

        return {
          id: item.id!,
          name: item.itemData?.name || 'Unnamed Product',
          description: item.itemData?.description || undefined,
          category: item.itemData?.categoryId || undefined,
          variations: itemVariations,
        };
      });
    } catch (error) {
      console.error('Square Catalog API error:', error);
      throw new Error('Failed to search catalog');
    }
  }

  async getInventory(locationId: string, catalogObjectIds?: string[]): Promise<SquareInventory[]> {
    try {
      const response = await this.getClient().inventoryApi.batchRetrieveInventoryCounts({
        locationIds: [locationId],
        catalogObjectIds,
      });

      const counts = response.result.counts || [];

      return counts.map(count => ({
        variationId: count.catalogObjectId!,
        quantity: parseInt(count.quantity || '0'),
        lastUpdated: count.calculatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Square Inventory API error:', error);
      throw new Error('Failed to retrieve inventory');
    }
  }

  async getAllLocations() {
    try {
      const response = await this.getClient().locationsApi.listLocations();
      return response.result.locations || [];
    } catch (error) {
      console.error('Square Locations API error:', error);
      throw new Error('Failed to retrieve locations');
    }
  }

  async getLocation(locationId: string) {
    try {
      const response = await this.getClient().locationsApi.retrieveLocation(locationId);
      return response.result.location;
    } catch (error) {
      console.error('Square Location API error:', error);
      throw new Error('Failed to retrieve location');
    }
  }

  async syncMerchantData(locationId: string) {
    try {
      // Get location details
      const location = await this.getLocation(locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      // Get all catalog items
      const allItemsResponse = await this.getClient().catalogApi.listCatalog(undefined, 'ITEM');
      const items = allItemsResponse.result.objects || [];
      
      // Get variations separately
      const variationsResponse = await this.getClient().catalogApi.listCatalog(undefined, 'ITEM_VARIATION');
      const allVariations = variationsResponse.result.objects || [];

      // Transform to our format
      const products: SquareProduct[] = items.map(item => {
        const itemVariations = allVariations
          .filter(obj => obj.type === 'ITEM_VARIATION' && obj.itemVariationData?.itemId === item.id)
          .map(variation => ({
            id: variation.id!,
            name: variation.itemVariationData?.name || 'Default',
            price: Number(variation.itemVariationData?.priceMoney?.amount || 0) / 100,
            sku: variation.itemVariationData?.sku || undefined,
          }));

        return {
          id: item.id!,
          name: item.itemData?.name || 'Unnamed Product',
          description: item.itemData?.description || undefined,
          category: item.itemData?.categoryId || undefined,
          variations: itemVariations,
        };
      });

      // Get inventory for all variations
      const variationIds = products.flatMap(p => p.variations.map(v => v.id));
      const inventory = await this.getInventory(locationId, variationIds);

      return {
        location,
        products,
        inventory,
      };
    } catch (error) {
      console.error('Square sync error:', error);
      throw new Error('Failed to sync merchant data');
    }
  }

  verifyWebhookSignature(body: string, signature: string, url: string): boolean {
    const crypto = require('crypto');
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    
    if (!signatureKey) {
      throw new Error('SQUARE_WEBHOOK_SIGNATURE_KEY is required');
    }

    const hmac = crypto.createHmac('sha1', signatureKey);
    hmac.update(url + body);
    const hash = hmac.digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  }
}

// Create singleton instance
export const squareAPI = new SquareAPIClient();
