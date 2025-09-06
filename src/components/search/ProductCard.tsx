'use client';

import Image from 'next/image';
import { MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDistance } from '@/lib/utils';
import type { ProductWithMerchant } from '@/lib/types';

interface ProductCardProps {
  product: ProductWithMerchant;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const lowestPrice = Math.min(...product.variations.map(v => v.price));
  const hasMultiplePrices = product.variations.some(v => v.price !== lowestPrice);

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Stock badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.totalStock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <Package className="w-3 h-3 mr-1" />
              {product.totalStock > 0 ? `${product.totalStock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Distance badge */}
          {product.merchant.distance && (
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <MapPin className="w-3 h-3 mr-1" />
                {formatDistance(product.merchant.distance)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </CardTitle>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          <span className="text-lg font-bold text-gray-900">
            {hasMultiplePrices ? 'From ' : ''}{formatCurrency(lowestPrice)}
          </span>
          {product.category && (
            <span className="ml-2 text-sm text-gray-500">
              • {product.category}
            </span>
          )}
        </div>

        {/* Store info */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.merchant.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {product.merchant.address.street}, {product.merchant.address.city}
            </p>
          </div>
          
          {product.merchant.distance && (
            <div className="ml-2 text-right">
              <p className="text-sm font-medium text-blue-600">
                {formatDistance(product.merchant.distance)}
              </p>
              <p className="text-xs text-gray-500">away</p>
            </div>
          )}
        </div>

        {/* Variations preview */}
        {product.variations.length > 1 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Available in:</p>
            <div className="flex flex-wrap gap-1">
              {product.variations.slice(0, 3).map((variation, index) => (
                <span
                  key={variation.id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                >
                  {Object.values(variation.attributes).join(', ')}
                  {variation.inventory.quantity > 0 && (
                    <span className="ml-1 text-green-600">
                      ({variation.inventory.quantity})
                    </span>
                  )}
                </span>
              ))}
              {product.variations.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                  +{product.variations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

