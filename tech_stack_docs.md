# TECH_STACK.md - Local Inventory Finder Technical Specifications

## 🏗️ Architecture Overview

The Local Inventory Finder follows a modern, serverless architecture optimized for real-time inventory search and location-based queries.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile/Web    │    │   Square POS    │    │    Mapbox       │
│   Frontend      │    │   Systems       │    │   Services      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ HTTPS/WSS            │ Webhooks/API         │ API
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js 14 App Router                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Search    │  │   Product   │  │     Location        │ │
│  │   Engine    │  │   Details   │  │     Services        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │ Prisma ORM
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Merchants  │  │  Products   │  │    Inventory        │ │
│  │  & Stores   │  │ & Variants  │  │   & Analytics       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Frontend Stack

### Next.js 14 with App Router
**Version:** 14.0+ (latest stable)
**Key Features:**
- Server Components for optimal performance
- Built-in API routes for backend logic
- Automatic code splitting and optimization
- Image optimization with next/image
- Built-in CSS and TypeScript support

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['images.squarecdn.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
}

module.exports = nextConfig
```

### React 18
**Version:** 18.2+
**Key Features:**
- Concurrent rendering for better UX
- Suspense for data fetching
- Server Components support
- Enhanced React DevTools

### TypeScript
**Version:** 5.0+
**Configuration:**
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🎨 Styling & UI Framework

### Tailwind CSS
**Version:** 3.4+
**Configuration:**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### UI Components
**Approach:** Custom components built with Tailwind CSS
**Base Components:**
- Button variants (primary, secondary, ghost)
- Input fields with validation states
- Card layouts with consistent spacing
- Loading skeletons and spinners
- Modal and drawer components

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
}
```

## 🗄️ Database Layer

### PostgreSQL
**Version:** 14+
**Hosting:** Supabase (managed PostgreSQL)
**Key Features:**
- JSONB support for flexible data storage
- Full-text search capabilities
- PostGIS extension for geospatial queries
- Row Level Security (RLS) support

### Prisma ORM
**Version:** 5.0+
**Why Prisma:**
- Type-safe database access
- Automatic migrations
- Built-in connection pooling
- Excellent TypeScript integration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id              String      @id @default(cuid())
  squareItemId    String      @unique
  merchantId      String
  name            String
  description     String?
  category        String?
  imageUrl        String?
  basePrice       Float?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  merchant        Merchant    @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  variations      ProductVariation[]
  inventory       Inventory[]
  
  @@map("products")
  @@index([merchantId])
  @@index([category])
  @@fulltext([name, description])
}
```

### Database Optimization
```sql
-- Full-text search index
CREATE INDEX products_search_idx ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Geospatial index for merchant locations
CREATE INDEX merchants_location_idx ON merchants USING GIST (ST_Point(longitude, latitude));

-- Composite index for inventory queries
CREATE INDEX inventory_product_quantity_idx ON inventory (product_id, quantity) WHERE quantity > 0;
```

## 🔌 External API Integrations

### Square APIs
**SDK Version:** @square/web-sdk 30.0+
**APIs Used:**
- **Catalog API:** Product information and categories
- **Inventory API:** Real-time stock levels
- **Locations API:** Store information and addresses
- **Webhooks:** Real-time inventory updates

```typescript
// lib/square-client.ts
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

export const catalogApi = client.catalogApi;
export const inventoryApi = client.inventoryApi;
export const locationsApi = client.locationsApi;
export const webhooksApi = client.webhooksApi;

// Example: Search products in catalog
export async function searchSquareCatalog(query: string, locationId: string) {
  try {
    const response = await catalogApi.searchCatalogObjects({
      objectTypes: ['ITEM'],
      query: {
        textQuery: {
          synonyms: [query]
        }
      },
      includeRelatedObjects: true,
    });
    
    return response.result.objects || [];
  } catch (error) {
    console.error('Square Catalog API error:', error);
    throw new Error('Failed to search products');
  }
}
```

### Mapbox Integration
**SDK Version:** mapbox-gl ^2.15.0
**APIs Used:**
- **Maps API:** Interactive maps display
- **Geocoding API:** Address to coordinates conversion
- **Directions API:** Navigation between locations

```typescript
// lib/mapbox-client.ts
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export class MapboxService {
  private map: mapboxgl.Map | null = null;
  
  initializeMap(container: string | HTMLElement, options: Partial<mapboxgl.MapboxOptions> = {}) {
    this.map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [153.616667, -28.643056], // Byron Bay coordinates
      zoom: 13,
      ...options,
    });
    
    return this.map;
  }
  
  async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
  
  calculateDistance(point1: [number, number], point2: [number, number]): number {
    // Haversine formula implementation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2[1] - point1[1]);
    const dLon = this.toRadians(point2[0] - point1[0]);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1[1])) * Math.cos(this.toRadians(point2[1])) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

## 🔄 State Management

### React Built-in State
**Primary Approach:** useState, useReducer, useContext
**When to Use:**
- Component-level state management
- Simple global state (theme, user preferences)
- Form state management

```typescript
// hooks/useSearch.ts
interface SearchState {
  query: string;
  results: Product[];
  loading: boolean;
  error: string | null;
  location: GeolocationPosition | null;
}

type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: Product[] }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'SET_LOCATION'; payload: GeolocationPosition };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SEARCH_START':
      return { ...state, loading: true, error: null };
    case 'SEARCH_SUCCESS':
      return { ...state, loading: false, results: action.payload };
    case 'SEARCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    default:
      return state;
  }
}

export function useSearch() {
  const [state, dispatch] = useReducer(searchReducer, {
    query: '',
    results: [],
    loading: false,
    error: null,
    location: null,
  });
  
  // Search logic implementation...
  
  return { ...state, dispatch };
}
```

### Server State Management
**Approach:** React Query (TanStack Query) for future phases
**Benefits:**
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Offline support

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy loading for heavy components
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false, // Mapbox requires client-side rendering
});

const ProductModal = dynamic(() => import('@/components/ProductModal'), {
  loading: () => <div>Loading...</div>,
});
```

### Image Optimization
```typescript
// Next.js Image component with optimization
import Image from 'next/image';

<Image
  src={product.imageUrl || '/placeholder-product.jpg'}
  alt={product.name}
  width={300}
  height={300}
  className="rounded-lg object-cover"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  priority={index < 4} // Priority loading for first 4 images
/>
```

### Bundle Analysis
```bash
# Bundle analyzer for optimization
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Next.js config
})
```

## 🔒 Security Configuration

### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/local_inventory"
SQUARE_APPLICATION_ID="sandbox-sq0idb-xxxxxxxxxx"
SQUARE_ACCESS_TOKEN="EAAAxxxxxxxxxx"
SQUARE_WEBHOOK_SIGNATURE_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.eyJ1Ijoibxxxxxxxxxxxxxxxx"
WEBHOOK_SECRET="your-webhook-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### API Security
```typescript
// lib/api-security.ts
import { NextRequest } from 'next/server';
import crypto from 'crypto';

export function verifySquareWebhook(
  body: string,
  signature: string,
  url: string
): boolean {
  const hmac = crypto.createHmac('sha1', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!);
  hmac.update(url + body);
  const hash = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}

export function rateLimit() {
  // Implement rate limiting logic
  // Consider using Upstash Redis for distributed rate limiting
}
```

## 📱 Mobile Optimization

### Responsive Breakpoints
```css
/* Mobile-first breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### PWA Configuration
```javascript
// next.config.js with PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Next.js config
});
```

### Touch Optimizations
- Minimum touch target size: 44x44px
- Swipe gestures for map navigation
- Pull-to-refresh for search results

## 🚀 Deployment & Infrastructure

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/webhook/square/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "SQUARE_ACCESS_TOKEN": "@square-access-token"
  }
}
```

### Database Hosting
**Supabase Configuration:**
- PostgreSQL 14+ with PostGIS extension
- Row Level Security enabled
- Connection pooling configured
- Automatic backups enabled

### CDN & Assets
- Vercel Edge Network for static assets
- Next.js Image optimization
- Mapbox CDN for map tiles

## 🔍 Search Engine Implementation

### Full-Text Search
```sql
-- PostgreSQL full-text search
CREATE INDEX products_fts_idx ON products 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(category, '')));

-- Search query with ranking
SELECT p.*, ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', $1)) as rank
FROM products p
WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, p.created_at DESC;
```

### Geospatial Queries
```sql
-- Find stores within radius using PostGIS
SELECT m.*, 
       ST_Distance(
         ST_GeogFromText('POINT(' || m.longitude || ' ' || m.latitude || ')'),
         ST_GeogFromText('POINT(' || $2 || ' ' || $1 || ')')
       ) / 1000 as distance_km
FROM merchants m
WHERE ST_DWithin(
  ST_GeogFromText('POINT(' || m.longitude || ' ' || m.latitude || ')'),
  ST_GeogFromText('POINT(' || $2 || ' ' || $1 || ')'),
  $3 * 1000  -- Convert km to meters
)
ORDER BY distance_km;
```

## 📊 Monitoring & Analytics

### Application Monitoring
```typescript
// lib/monitoring.ts
export function trackEvent(event: string, properties: Record<string, any> = {}) {
  // Implementation for analytics tracking
  if (typeof window !== 'undefined') {
    // Client-side tracking
    console.log('Event:', event, properties);
  }
}

export function trackError(error: Error, context: Record<string, any> = {}) {
  console.error('Application Error:', error, context);
  
  // Send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }
}
```

### Performance Monitoring
```typescript
// lib/performance.ts
export function measureSearchPerformance(searchQuery: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackEvent('search_performance', {
        query: searchQuery,
        duration: Math.round(duration),
      });
      
      return duration;
    }
  };
}
```

## 🔄 Development Workflow

### Package Management
**Tool:** npm (Node.js 18+)
**Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Quality Assurance
**Linting:** ESLint with Next.js configuration
**Formatting:** Prettier with automatic formatting
**Type Checking:** TypeScript strict mode
**Testing:** Jest + React Testing Library

This technical stack provides a solid foundation for building a scalable, performant local inventory finder application with real-time capabilities and excellent mobile experience.