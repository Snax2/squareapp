'use client';

import { ProductCard } from './ProductCard';
import { SearchResultsSkeleton } from '@/components/ui/loading';
import type { ProductWithMerchant } from '@/lib/types';

interface SearchResultsProps {
  products: ProductWithMerchant[];
  loading: boolean;
  error: string | null;
  query: string;
  onProductClick: (product: ProductWithMerchant) => void;
}

export function SearchResults({ 
  products, 
  loading, 
  error, 
  query,
  onProductClick 
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Searching for "{query}"...
          </h2>
          <p className="text-gray-600 mt-1">Finding products near you</p>
        </div>
        <SearchResultsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Search Failed
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start Your Search
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Search for products like "black hoodie", "iPhone case", or "coffee beans" to find items in nearby stores.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m16 0v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Products Found
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          We couldn't find any products matching "{query}" in nearby stores.
        </p>
        <div className="text-sm text-gray-500">
          <p>Try:</p>
          <ul className="mt-2 space-y-1">
            <li>• Using different keywords</li>
            <li>• Checking your spelling</li>
            <li>• Using more general terms</li>
            <li>• Increasing your search radius</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Found {products.length} result{products.length === 1 ? '' : 's'} for "{query}"
        </h2>
        <p className="text-gray-600 mt-1">
          Sorted by distance and availability
        </p>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>

      {/* Load more section (placeholder for future pagination) */}
      {products.length >= 20 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Showing first {products.length} results. More pagination coming soon!
          </p>
        </div>
      )}
    </div>
  );
}

