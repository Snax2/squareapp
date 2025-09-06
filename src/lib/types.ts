// Core business types
export interface SearchParams {
  query: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  category?: string;
  inStock?: boolean;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data?: {
    products: ProductWithMerchant[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
    searchMeta: {
      query: string;
      location?: {
        lat: number;
        lng: number;
      };
      radius: number;
      executionTime: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface ProductWithMerchant {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  basePrice?: number;
  merchant: {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
    latitude: number;
    longitude: number;
    distance?: number;
  };
  variations: ProductVariationWithInventory[];
  totalStock: number;
}

export interface ProductVariationWithInventory {
  id: string;
  name: string;
  price: number;
  attributes: Record<string, any>;
  inventory: {
    quantity: number;
    lastUpdated: string;
  };
}

export interface MerchantAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

// API Error types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Form validation types
export interface SearchFormData {
  query: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  radius: number;
}

// Map types
export interface MapPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  productCount: number;
}

// Square API types
export interface SquareProduct {
  id: string;
  name: string;
  description?: string;
  category?: string;
  variations: SquareVariation[];
}

export interface SquareVariation {
  id: string;
  name: string;
  price: number;
  sku?: string;
}

export interface SquareInventory {
  variationId: string;
  quantity: number;
  lastUpdated: string;
}

// Geolocation types
export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DistanceResult {
  distance: number; // in kilometers
  duration?: number; // in minutes
}

