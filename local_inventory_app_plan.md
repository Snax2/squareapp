# Local Inventory Finder App - Complete Development Plan

## 📋 Project Overview

**Name:** Local Inventory Finder  
**Target Market:** Byron Bay, Australia (Phase 1)  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, Mapbox, Square APIs  
**Deployment:** Vercel + Supabase  

## 🎯 MVP Goals

- Consumer web app for finding specific products nearby
- Integration with Square POS systems for real-time inventory
- Map-based search results with store locations
- Mobile-first responsive design
- Focus on Byron Bay merchants initially

## 📁 Project Structure

```
local-inventory-finder/
├── README.md
├── CURSOR_RULES.md
├── TECH_STACK.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── webhook/
│   │   │   │   └── square/
│   │   │   │       └── route.ts
│   │   │   └── sync/
│   │   │       └── square/
│   │   │           └── route.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── loading.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   └── StorePin.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── database.ts
│   │   ├── square-api.ts
│   │   ├── mapbox.ts
│   │   ├── utils.ts
│   │   └── types.ts
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   ├── useSearch.ts
│   │   └── useLocalStorage.ts
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── favicon.ico
│   └── images/
└── docs/
    ├── SETUP.md
    ├── API.md
    └── DEPLOYMENT.md
```

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Merchant {
  id               String    @id @default(cuid())
  squareMerchantId String    @unique
  name             String
  email            String?
  phone            String?
  address          Json
  latitude         Float
  longitude        Float
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  products         Product[]
  
  @@map("merchants")
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

model ProductVariation {
  id                   String    @id @default(cuid())
  squareVariationId    String    @unique
  productId            String
  name                 String
  sku                  String?
  price                Float
  attributes           Json      // color, size, etc.
  isActive             Boolean   @default(true)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  
  product              Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  inventory            Inventory[]
  
  @@map("product_variations")
  @@index([productId])
}

model Inventory {
  id                String             @id @default(cuid())
  productId         String
  variationId       String
  quantity          Int                @default(0)
  lastSyncAt        DateTime           @default(now())
  
  product           Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  variation         ProductVariation   @relation(fields: [variationId], references: [id], onDelete: Cascade)
  
  @@map("inventory")
  @@unique([productId, variationId])
  @@index([productId])
  @@index([variationId])
}

model Search {
  id        String   @id @default(cuid())
  query     String
  latitude  Float?
  longitude Float?
  radius    Float?
  results   Int      @default(0)
  createdAt DateTime @default(now())
  
  @@map("searches")
  @@index([createdAt])
  @@index([query])
}
```

## 🔧 Environment Variables

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/local_inventory"

# Square API
SQUARE_ENVIRONMENT="sandbox" # or "production"
SQUARE_APPLICATION_ID="your_app_id"
SQUARE_ACCESS_TOKEN="your_access_token"
SQUARE_WEBHOOK_SIGNATURE_KEY="your_webhook_signature"

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your_mapbox_token"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
WEBHOOK_SECRET="your_webhook_secret"

# Default Search Settings
DEFAULT_SEARCH_RADIUS_KM=10
MAX_SEARCH_RESULTS=50

# Sync Settings
SYNC_INTERVAL_MINUTES=60
```

## 🚀 Development Phases

### Phase 1: MVP Development (Weeks 1-4)

**Week 1: Foundation**
- [ ] Project setup with Next.js 14 + TypeScript
- [ ] Database setup with Prisma + Supabase
- [ ] Basic UI components with Tailwind CSS
- [ ] Square API integration setup
- [ ] Authentication flow for Square OAuth

**Week 2: Core Features**
- [ ] Product search functionality
- [ ] Mapbox integration for location services
- [ ] Basic search results display
- [ ] Product detail pages
- [ ] Geolocation support

**Week 3: Inventory Integration**
- [ ] Square Catalog API integration
- [ ] Square Inventory API integration
- [ ] Real-time webhook handling
- [ ] Inventory sync mechanisms
- [ ] Search with location radius

**Week 4: Polish & Testing**
- [ ] Mobile-responsive design
- [ ] Error handling and loading states
- [ ] Performance optimization
- [ ] Byron Bay test data setup
- [ ] User testing and feedback

### Phase 2: Beta Launch (Weeks 5-6)

- [ ] Multiple merchant onboarding
- [ ] Advanced search filters
- [ ] Store information pages
- [ ] Analytics dashboard
- [ ] Production deployment

## 🎨 UI/UX Design Specifications

### Color Scheme
```css
:root {
  --primary: #2563eb;      /* Blue-600 */
  --primary-dark: #1d4ed8; /* Blue-700 */
  --secondary: #10b981;    /* Emerald-500 */
  --accent: #f59e0b;       /* Amber-500 */
  --neutral: #6b7280;      /* Gray-500 */
  --background: #ffffff;   
  --surface: #f9fafb;      /* Gray-50 */
  --error: #ef4444;        /* Red-500 */
  --success: #10b981;      /* Emerald-500 */
}
```

### Typography
- **Headings:** Inter, sans-serif
- **Body:** Inter, sans-serif
- **Monospace:** JetBrains Mono

### Component Design System
- **Buttons:** Rounded corners (8px), shadow on hover
- **Cards:** Subtle shadow, rounded corners (12px)
- **Inputs:** Border focus states, consistent padding
- **Maps:** Full viewport height on mobile

## 📱 Mobile-First Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

## 🔍 Search Algorithm Specifications

### Fuzzy Search Implementation
- **Primary:** Full-text search on product name
- **Secondary:** Category matching
- **Tertiary:** Description keyword matching
- **Scoring:** Relevance + Distance + Stock availability

### Location-Based Search
- **Default Radius:** 10km
- **Maximum Radius:** 50km
- **Sorting:** Distance ascending, then relevance
- **Geolocation:** Browser API with fallback to IP geolocation

## 🔔 Real-Time Updates Strategy

### Square Webhooks
- **inventory.count.updated:** Update inventory quantities
- **catalog.version.updated:** Refresh product information
- **Webhook Verification:** Signature verification required
- **Retry Logic:** Exponential backoff for failed webhooks

### Fallback Sync
- **Frequency:** Every hour (configurable)
- **Full Sync:** Weekly complete inventory refresh
- **Error Handling:** Log failures, alert on consecutive errors

## 📊 Analytics & Monitoring

### Search Analytics
- Popular search terms
- Search result click-through rates
- Geographic search patterns
- Conversion tracking (searches to store visits)

### Performance Monitoring
- API response times
- Database query performance
- Webhook processing times
- Map loading performance

## 🔐 Security Considerations

### API Security
- Rate limiting on search endpoints
- Square webhook signature verification
- Input validation and sanitization
- CORS configuration

### Data Privacy
- No user account data in MVP
- Search logs anonymization
- GDPR compliance considerations
- Merchant data protection

## 🚀 Deployment Strategy

### Development Environment
- Local development with Docker
- Supabase for database
- Square Sandbox environment

### Staging Environment
- Vercel preview deployments
- Staging database
- Square Sandbox testing

### Production Environment
- Vercel production deployment
- Supabase production database
- Square Production environment
- CDN for static assets

## 📈 Success Metrics

### MVP Success Criteria
- [ ] 10+ Byron Bay merchants onboarded
- [ ] 100+ products indexed
- [ ] 50+ daily searches
- [ ] <2 second search response times
- [ ] 95% webhook processing success rate

### User Experience Metrics
- Average session duration
- Search-to-click conversion rate
- Mobile vs desktop usage
- Geographic coverage

## 🔄 Post-MVP Roadmap

### Phase 2 Features
- User accounts and favorites
- Push notifications for restocked items
- Advanced filters (price, brand, store hours)
- Store owner dashboard

### Phase 3 Features
- Multiple POS integrations
- Native mobile apps
- Social features and reviews
- Loyalty program integration

### Phase 4 Features
- AI-powered recommendations
- Augmented reality features
- Voice search capability
- Predictive inventory insights

## 🛠️ Development Tools & Resources

### Required Tools
- Node.js 18+
- PostgreSQL 14+
- Cursor IDE
- Git version control
- Postman for API testing

### Square API Documentation
- [Square Developer Portal](https://developer.squareup.com/)
- [Catalog API](https://developer.squareup.com/docs/catalog-api/what-it-does)
- [Inventory API](https://developer.squareup.com/docs/inventory-api/what-it-does)
- [Webhooks Guide](https://developer.squareup.com/docs/webhooks/overview)

### Mapbox Resources
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Distance Matrix API](https://docs.mapbox.com/api/navigation/matrix/)

## 🐛 Common Issues & Solutions

### Square API Issues
- **Rate Limiting:** Implement exponential backoff
- **Webhook Duplicates:** Use idempotency keys
- **Token Expiration:** Automatic token refresh logic

### Performance Issues
- **Slow Searches:** Database indexing optimization
- **Map Loading:** Lazy loading and caching
- **Large Inventories:** Pagination and virtualization

### Mobile Issues
- **Geolocation Permissions:** Graceful fallbacks
- **Viewport Issues:** Proper meta tags
- **Touch Interactions:** Appropriate touch targets

---

*This plan serves as the comprehensive guide for developing the Local Inventory Finder app. Update this document as requirements evolve and new insights are gained during development.*