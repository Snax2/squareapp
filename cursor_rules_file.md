# CURSOR_RULES.md - Local Inventory Finder Development Guidelines

## 🎯 Project Context

You are building a **Local Inventory Finder** web application that helps consumers find specific products in nearby stores. The app integrates with Square POS systems to provide real-time inventory data and uses Mapbox for location-based search.

**Target Market:** Byron Bay, Australia (initial focus)  
**User Goal:** Find specific products nearby (e.g., "black hoodie", "iPhone case")  
**Business Model:** Drive foot traffic to local merchants  

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** None in MVP (merchant-only Square OAuth)
- **Maps:** Mapbox GL JS
- **APIs:** Square Catalog/Inventory APIs
- **Deployment:** Vercel + Supabase

### Key Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "mapbox-gl": "^2.15.0",
  "square": "^30.0.0",
  "zod": "^3.22.0",
  "react-hook-form": "^7.45.0"
}
```

## 📝 Coding Standards

### File Naming Conventions
- **Components:** PascalCase (`SearchBar.tsx`, `ProductCard.tsx`)
- **Pages:** lowercase with hyphens (`product-detail`, `search-results`)
- **Utilities:** camelCase (`api-client.ts`, `search-utils.ts`)
- **Constants:** SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Code Organization
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Core business logic
├── hooks/               # Custom React hooks
├── utils/               # Helper functions
└── types/               # TypeScript type definitions
```

### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all API responses
- Use Zod for runtime validation
- Prefer type inference over explicit typing when clear
- Export types from centralized `types/` directory

```typescript
// ✅ Good
interface ProductSearchResponse {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
}

// ❌ Avoid
const searchProducts = (query: any): any => {
  // implementation
}
```

### Component Structure
```typescript
// ✅ Preferred component structure
'use client';

import { useState, useEffect } from 'react';
import { type ComponentProps } from '@/types';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search for products...",
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  
  // Component logic here
  
  return (
    <div className={`search-bar ${className}`}>
      {/* JSX here */}
    </div>
  );
}
```

## 🎨 UI/UX Guidelines

### Tailwind CSS Best Practices
- Use design system tokens consistently
- Mobile-first responsive design
- Prefer utility classes over custom CSS
- Use component composition over large class lists

```typescript
// ✅ Good - Component composition
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
};

// ❌ Avoid - Inline utility overload
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

### Design System
```css
/* Use these Tailwind utilities consistently */
--primary: theme('colors.blue.600')
--secondary: theme('colors.emerald.500')
--accent: theme('colors.amber.500')
--neutral: theme('colors.gray.500')
--danger: theme('colors.red.500')
--success: theme('colors.green.500')

/* Spacing Scale */
--space-xs: theme('spacing.1')    /* 4px */
--space-sm: theme('spacing.2')    /* 8px */
--space-md: theme('spacing.4')    /* 16px */
--space-lg: theme('spacing.6')    /* 24px */
--space-xl: theme('spacing.8')    /* 32px */
```

### Component Design Principles
- **Loading States:** Always show loading spinners for async operations
- **Error States:** Clear error messages with retry options
- **Empty States:** Helpful messaging when no results found
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation

## 🔌 API Integration Guidelines

### Square API Integration
```typescript
// ✅ Preferred API client structure
export class SquareAPIClient {
  private client: Client;
  
  constructor() {
    this.client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT as Environment,
    });
  }
  
  async searchCatalog(query: string): Promise<CatalogItem[]> {
    try {
      const response = await this.client.catalogApi.searchCatalogObjects({
        objectTypes: ['ITEM'],
        query: {
          textQuery: {
            synonyms: [query]
          }
        }
      });
      
      return response.result.objects || [];
    } catch (error) {
      console.error('Square API error:', error);
      throw new Error('Failed to search catalog');
    }
  }
}
```

### Error Handling
- Wrap all API calls in try-catch blocks
- Use consistent error response format
- Log errors for monitoring
- Provide user-friendly error messages

```typescript
// ✅ Consistent error handling
export async function searchProducts(query: string) {
  try {
    const response = await fetch(`/api/search?q=${query}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error('Unable to search products at this time');
  }
}
```

## 🗺️ Location & Map Guidelines

### Mapbox Integration
```typescript
// ✅ Mapbox setup
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export function initializeMap(container: HTMLElement) {
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [153.616667, -28.643056], // Byron Bay coordinates
    zoom: 13,
  });
}
```

### Geolocation Handling
```typescript
// ✅ Robust geolocation with fallbacks
export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      setLocation,
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);
  
  return { location, error };
}
```

## 📊 Database & Performance

### Prisma Best Practices
- Use transactions for related operations
- Implement proper indexing strategy
- Use `select` to limit returned fields
- Implement pagination for large datasets

```typescript
// ✅ Optimized database queries
export async function searchProductsNearby(
  query: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) {
  return await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        {
          merchant: {
            // Use raw SQL for distance calculation
            // This should be implemented with PostGIS for production
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      merchant: {
        select: {
          name: true,
          latitude: true,
          longitude: true,
        }
      },
      inventory: {
        select: {
          quantity: true,
        }
      }
    },
    take: 50,
  });
}
```

## 🔄 State Management

### Local State (useState/useReducer)
- Use for component-specific state
- Prefer `useReducer` for complex state logic
- Keep state as close to where it's used as possible

### Global State
- Use React Context for truly global state
- Consider Zustand for complex state management
- Avoid prop drilling through context

```typescript
// ✅ Search state management
export function useSearch() {
  const [state, dispatch] = useReducer(searchReducer, {
    query: '',
    results: [],
    loading: false,
    error: null,
  });
  
  const searchProducts = useCallback(async (query: string) => {
    dispatch({ type: 'SEARCH_START', payload: query });
    
    try {
      const results = await api.searchProducts(query);
      dispatch({ type: 'SEARCH_SUCCESS', payload: results });
    } catch (error) {
      dispatch({ type: 'SEARCH_ERROR', payload: error.message });
    }
  }, []);
  
  return { ...state, searchProducts };
}
```

## 🚀 Performance Optimization

### Code Splitting
- Use dynamic imports for heavy components
- Implement route-based code splitting
- Lazy load map components

```typescript
// ✅ Dynamic imports
const MapView = dynamic(() => import('@/components/map/MapView'), {
  loading: () => <MapSkeleton />,
  ssr: false, // Disable SSR for Mapbox
});
```

### Image Optimization
```typescript
// ✅ Next.js Image optimization
import Image from 'next/image';

<Image
  src={product.imageUrl}
  alt={product.name}
  width={300}
  height={200}
  className="rounded-lg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Caching Strategy
- Use Next.js built-in caching for static data
- Implement Redis for frequently accessed data
- Cache map tiles and geocoding results

## 🧪 Testing Guidelines

### Unit Testing
```typescript
// ✅ Component testing
import { render, screen } from '@testing-library/react';
import SearchBar from '@/components/search/SearchBar';

test('SearchBar calls onSearch when form is submitted', async () => {
  const mockOnSearch = jest.fn();
  render(<SearchBar onSearch={mockOnSearch} />);
  
  const input = screen.getByRole('searchbox');
  const submitButton = screen.getByRole('button', { name: /search/i });
  
  await userEvent.type(input, 'black hoodie');
  await userEvent.click(submitButton);
  
  expect(mockOnSearch).toHaveBeenCalledWith('black hoodie');
});
```

### API Testing
```typescript
// ✅ API route testing
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/search/route';

test('/api/search returns products', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { q: 'hoodie', lat: '-28.65', lng: '153.61' },
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  const data = JSON.parse(res._getData());
  expect(data).toHaveProperty('products');
});
```

## 📱 Mobile-First Development

### Responsive Design Principles
```typescript
// ✅ Mobile-first responsive classes
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4
">
  {/* Product cards */}
</div>
```

### Touch Interactions
- Minimum touch target size: 44px
- Implement swipe gestures where appropriate
- Optimize for thumb navigation

### Performance on Mobile
- Minimize JavaScript bundle size
- Optimize images for mobile screens
- Use service workers for offline functionality

## 🔐 Security Best Practices

### Input Validation
```typescript
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(1).max(50).default(10),
});

export async function validateSearchRequest(data: unknown) {
  return SearchSchema.parse(data);
}
```

### Environment Variables
- Never expose sensitive keys in client-side code
- Use `NEXT_PUBLIC_` prefix only for truly public variables
- Validate environment variables on startup

### API Security
- Implement rate limiting
- Validate webhook signatures
- Sanitize all user inputs

## 📈 Analytics & Monitoring

### Event Tracking
```typescript
// ✅ Search analytics
export function trackSearch(query: string, resultCount: number) {
  // Save to database for analytics
  prisma.search.create({
    data: {
      query,
      results: resultCount,
      createdAt: new Date(),
    }
  });
}
```

### Error Monitoring
- Log all errors with context
- Monitor API response times
- Track user journey funnel

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Webhook endpoints tested
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met

### Post-deployment
- [ ] Square webhook endpoints updated
- [ ] SSL certificate verified
- [ ] Analytics tracking confirmed
- [ ] Error monitoring active
- [ ] Performance monitoring setup

## 🔄 Development Workflow

### Git Workflow
- Use feature branches for new development
- Write descriptive commit messages
- Include issue numbers in commits
- Squash commits before merging

### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] Error handling implemented
- [ ] Mobile responsiveness tested
- [ ] Performance impact considered
- [ ] Security implications reviewed

---

**Remember:** This app's success depends on fast, accurate search results and a smooth mobile experience. Prioritize performance and user experience over feature complexity in the MVP phase.