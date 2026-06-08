# FarmLink - Production-Grade AgriTech Platform

Connect farmers, retailers, and investors on one platform.

## Project Structure

```
farmlink/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── validation/   # Shared Zod schemas
└── .github/          # GitHub workflows (CI/CD)
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL (DigitalOcean Managed)
- **Storage**: Cloudflare R2
- **Cache & Queues**: Redis + BullMQ
- **Real-time**: Socket.io (WebSocket)
- **Payments**: Paystack
- **AI**: Google Gemini 1.5 Flash API
- **Email**: Resend + React Email
- **SMS**: Africa's Talking
- **Monitoring**: Sentry, PostHog
- **Deployment**: Vercel (frontend), Docker (backend)

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+ (for development)

### Installation

1. Clone the repository and install dependencies:
```bash
cd farmlink
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
cd apps/api
pnpm run db:push  # Apply Prisma migrations
```

### Development

Run both frontend and backend in development mode:
```bash
pnpm dev
```

This will start:
- Next.js frontend: `http://localhost:3000`
- NestJS backend: `http://localhost:3001`

### Build

Build both apps for production:
```bash
pnpm build
```

### Testing

Run tests across the monorepo:
```bash
pnpm test
```

### Linting & Type Checking

```bash
pnpm lint      # Run ESLint
pnpm type-check # Run TypeScript type checking
```

## Database Schema

The main entities include:
- **Profiles**: Users (Farmer, Retailer, Investor, Supplier, Admin)
- **Farms**: Farm profiles with photos and crop portfolio
- **Listings**: Produce listings for sale
- **Campaigns**: Harvest investment campaigns
- **Investments**: Investment records in campaigns
- **DemandRequests**: Retailer requests for produce
- **Bids**: Farmer bids on demand requests
- **Transactions**: Payment records with escrow status
- **Messages**: Real-time messaging between users
- **Subscriptions**: User subscription plans
- **BoostRecords**: Promoted listings/campaigns

See `apps/api/prisma/schema.prisma` for full schema.

## Features (Phase 1)

### Core Platform
- ✅ Role-based authentication
- ✅ Farmer profiles & farm management
- ✅ Product marketplace with listings
- ✅ Real-time notifications
- ✅ In-app messaging

### Signature Features
- 🚀 Harvest Investment Marketplace
- 🤖 AI Crop Doctor (Gemini integration)
- 🔄 Retailer Demand Requests (Reverse Marketplace)
- 💳 Escrow Payments (Paystack)
- ⭐ Farm Trust Score

### Monetization
- Transaction fees (2.5% marketplace, 3% campaigns, 0.5% escrow)
- Subscription plans (Free, Farmer Pro, Retailer Pro, Investor Pro, Business)
- Boosted listings (GHS 20-150)
- Supplier marketplace (GHS 200-500/month)
- Data & analytics (B2B)
- Loan referrals (affiliate)
- Insurance pool management (10% fee)

## API Endpoints (Phase 1)

### Auth
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Farms
- `POST /farms` - Create farm
- `GET /farms/:id` - Get farm details
- `GET /farms` - List user farms

### Listings
- `POST /listings` - Create listing
- `GET /listings` - Browse all listings
- `GET /listings/:id` - Get listing details

### Campaigns
- `POST /campaigns` - Create harvest campaign
- `GET /campaigns` - Browse campaigns
- `POST /campaigns/:id/invest` - Invest in campaign

## Deployment

### Frontend (Vercel)
```bash
git push origin main  # Auto-deploys to Vercel
```

### Backend (Docker on DigitalOcean VPS)
```bash
docker-compose up -d
```

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "feat: description"`
3. Push to GitHub: `git push origin feature/name`
4. Open a Pull Request

## License

Proprietary - FarmLink Team
