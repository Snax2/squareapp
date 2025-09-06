'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, Package, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading';
import { formatCurrency, formatDistance } from '@/lib/utils';
import type { ProductWithMerchant } from '@/lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<ProductWithMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setProduct(data.data.product);
        } else {
          setError(data.error?.message || 'Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleBackClick = () => {
    window.history.back();
  };

  const getDirectionsUrl = (address: any) => {
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.postcode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoadingSkeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <LoadingSkeleton className="h-8 w-3/4" />
              <LoadingSkeleton className="h-4 w-full" />
              <LoadingSkeleton className="h-4 w-2/3" />
              <LoadingSkeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={handleBackClick} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-600">
              {error || 'The product you\'re looking for doesn\'t exist or has been removed.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lowestPrice = Math.min(...product.variations.map(v => v.price));
  const highestPrice = Math.max(...product.variations.map(v => v.price));
  const hasMultiplePrices = lowestPrice !== highestPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Product details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {product.category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {product.category}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                {hasMultiplePrices 
                  ? `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}`
                  : formatCurrency(lowestPrice)
                }
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">
                  {product.totalStock} in stock
                </span>
              </div>
            </div>

            {/* Variations */}
            {product.variations.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Available Options</h3>
                <div className="space-y-2">
                  {product.variations.map((variation) => (
                    <div
                      key={variation.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{variation.name}</p>
                        <p className="text-sm text-gray-500">
                          {Object.entries(variation.attributes).map(([key, value]) => (
                            `${key}: ${value}`
                          )).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(variation.price)}
                        </p>
                        <p className={`text-sm ${
                          variation.inventory.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {variation.inventory.quantity > 0 
                            ? `${variation.inventory.quantity} available`
                            : 'Out of stock'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Store information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Available at {product.merchant.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                  <p className="text-gray-600">
                    {product.merchant.address.street}<br />
                    {product.merchant.address.city}, {product.merchant.address.state} {product.merchant.address.postcode}<br />
                    {product.merchant.address.country}
                  </p>
                </div>

                {product.merchant.distance && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Distance</h4>
                    <p className="text-blue-600 font-medium">
                      {formatDistance(product.merchant.distance)} away
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => window.open(getDirectionsUrl(product.merchant.address), '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>

                {/* Contact info would go here if available */}
                <div className="text-sm text-gray-500">
                  <p>Contact the store directly for availability and pickup options.</p>
                </div>
              </div>
            </div>

            {/* Map integration could go here */}
            <div className="pt-4 border-t">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Interactive map coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

