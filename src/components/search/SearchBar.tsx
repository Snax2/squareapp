'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string, location?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search for products...", 
  className,
  initialQuery = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const {
    coordinates,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    hasLocation,
    permission,
  } = useGeolocation();

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.length > 1) {
      setLoadingSuggestions(true);
      
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search/suggestions?query=${encodeURIComponent(query)}&limit=5`);
          const data = await response.json();
          
          if (data.success) {
            setSuggestions(data.data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    onSearch(searchQuery, coordinates || undefined);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const getLocationButtonText = () => {
    if (locationLoading) return 'Getting location...';
    if (hasLocation) return 'Location enabled';
    if (locationError) return 'Location failed';
    return 'Use my location';
  };

  const getLocationButtonVariant = () => {
    if (hasLocation) return 'default';
    if (locationError) return 'destructive';
    return 'outline';
  };

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 h-12 text-lg"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            type="submit" 
            className="flex-1 h-12"
            disabled={!query.trim()}
          >
            <Search className="mr-2 h-5 w-5" />
            Search Products
          </Button>
          
          <Button
            type="button"
            variant={getLocationButtonVariant()}
            onClick={requestLocation}
            disabled={locationLoading || hasLocation}
            className="h-12"
          >
            <MapPin className="mr-2 h-5 w-5" />
            {getLocationButtonText()}
          </Button>
        </div>

        {/* Location Status */}
        {locationError && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {locationError}. Using Byron Bay as default location.
          </p>
        )}
        
        {hasLocation && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            Location detected! Showing nearby results.
          </p>
        )}
      </form>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

