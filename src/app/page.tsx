'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { MapView } from '@/components/map/MapView';
import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';
import type { ProductWithMerchant, SearchResponse } from '@/lib/types';

type ViewMode = 'list' | 'map';

export default function HomePage() {
  const [products, setProducts] = useState<ProductWithMerchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleSearch = async (searchQuery: string, location?: { latitude: number; longitude: number }) => {
    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    if (location) {
      setUserLocation(location);
    }

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        limit: '20',
        inStock: 'true',
      });

      if (location) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
        params.append('radius', '10');
      }

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      if (data.success && data.data) {
        setProducts(data.data.products);
      } else {
        setError(data.error?.message || 'Search failed');
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to search products');
      setProducts([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: ProductWithMerchant) => {
    // TODO: Navigate to product detail page
    console.log('Product clicked:', product);
  };

  const handleStoreClick = (storeId: string) => {
    // TODO: Show store details or filter products by store
    console.log('Store clicked:', storeId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Local Inventory Finder
              </h1>
              <p className="text-gray-600">Find products in nearby stores</p>
            </div>
            
            {/* View mode toggle */}
            {products.length > 0 && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center space-x-2"
                >
                  <List className="h-4 w-4" />
                  <span>List</span>
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="flex items-center space-x-2"
                >
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search section */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results section */}
        <div className="space-y-6">
          {viewMode === 'list' ? (
            <SearchResults
              products={products}
              loading={loading}
              error={error}
              query={query}
              onProductClick={handleProductClick}
            />
          ) : (
            <div className="space-y-4">
              {query && (
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {loading ? 'Searching...' : `${products.length} result${products.length === 1 ? '' : 's'} for "${query}"`}
                  </h2>
                </div>
              )}
              
              <MapView
                products={products}
                userLocation={userLocation || undefined}
                onStoreClick={handleStoreClick}
                height="500px"
                className="w-full"
              />

              {products.length > 0 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('list')}
                    className="mt-4"
                  >
                    View as List
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Local Inventory Finder. Built for Byron Bay and surrounding areas.</p>
            <p className="text-sm mt-2">
              Powered by Square POS integration and real-time inventory data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

