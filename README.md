# Local Inventory Finder

A modern web application that helps consumers find specific products in nearby stores using real-time inventory data from Square POS systems.

## 🚀 Features

- **Smart Search**: Find products by name, description, or category
- **Location-Based**: Shows nearby stores within a customizable radius
- **Real-Time Inventory**: Live stock levels from Square POS systems
- **Interactive Maps**: Powered by Mapbox with store locations
- **Mobile-First**: Responsive design optimized for all devices
- **Product Details**: Comprehensive product information and variations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Maps**: Mapbox GL JS
- **POS Integration**: Square APIs
- **Deployment**: Vercel + Supabase

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- Square developer account
- Mapbox account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd square-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/local_inventory"
   
   # Square API
   SQUARE_ENVIRONMENT="sandbox"
   SQUARE_ACCESS_TOKEN="your_access_token"
   SQUARE_WEBHOOK_SIGNATURE_KEY="your_webhook_signature"
   
   # Mapbox
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your_mapbox_token"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses Prisma with PostgreSQL and includes:

- **Merchants**: Store information and locations
- **Products**: Product catalog from Square
- **ProductVariations**: Different sizes, colors, etc.
- **Inventory**: Real-time stock levels
- **Search**: Analytics and search history

## 🔌 API Endpoints

### Search API
- `GET /api/search` - Search products by location and query
- `GET /api/search/suggestions` - Get search suggestions

### Product API
- `GET /api/products/[id]` - Get product details

### Sync API
- `POST /api/sync/square` - Sync data from Square
- `POST /api/webhook/square` - Square webhook handler

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── product/        # Product detail pages
│   └── layout.tsx      # Root layout
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── search/         # Search-related components
│   └── map/            # Map components
├── lib/                 # Core business logic
│   ├── database.ts     # Prisma client
│   ├── square-api.ts   # Square API integration
│   ├── mapbox.ts       # Mapbox utilities
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Helper functions
└── hooks/               # Custom React hooks
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript check
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting
- Tailwind CSS for styling

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Database Setup

1. Create a PostgreSQL database (Supabase recommended)
2. Add PostGIS extension for geospatial queries
3. Run migrations in production

### Square Configuration

1. Create a Square application
2. Set up webhook endpoints pointing to your domain
3. Configure OAuth for merchant onboarding

## 🗺️ Target Market

**Initial Focus**: Byron Bay, Australia
- Local merchants with Square POS systems
- Tourists and locals looking for specific products
- Small to medium-sized retail businesses

## 📈 Roadmap

### Phase 1 (Current)
- ✅ MVP with search and inventory integration
- ✅ Byron Bay merchants
- ✅ Basic mobile app

### Phase 2
- [ ] User accounts and favorites
- [ ] Push notifications
- [ ] Advanced filters
- [ ] Merchant dashboard

### Phase 3
- [ ] Multiple POS integrations
- [ ] Native mobile apps
- [ ] Social features
- [ ] Loyalty programs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please contact [your-email@example.com]

---

Built with ❤️ for the Byron Bay community

