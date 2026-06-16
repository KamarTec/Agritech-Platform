# Getting Started with FarmLink

## What's Been Set Up ✅

The complete monorepo structure for FarmLink is now ready with:

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, React Hook Form
- **Backend**: NestJS with Prisma ORM, JWT auth, and WebSockets support
- **Database**: PostgreSQL schema with 20+ models
- **Shared Code**: Type definitions and validation schemas
- **Docker**: Full containerization for production
- **CI/CD**: GitHub Actions workflow for automated testing

## Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\stepp\Downloads\Programs\ENT
pnpm install
```
✅ Already done!

### 2. Set Up Database (PostgreSQL)

**Option A: Use Docker (Recommended)**
```bash
docker-compose -f docker/docker-compose.yml up postgres
```

**Option B: Use Local PostgreSQL**
- Install PostgreSQL locally
- Create database: `createdb farmlink`
- Update `.env` with your connection string

### 3. Initialize Database Schema
```bash
cd apps/api
pnpm run prisma:push
```

### 4. Start Development Servers

**Terminal 1 - Start all services**
```bash
cd c:\Users\stepp\Downloads\Programs\ENT
pnpm dev
```

This will start:
- Frontend: http://localhost:3000 (Next.js dev)
- Backend: http://localhost:3001 (NestJS)

For production on the VPS, set the frontend API URL before building, then run it with PM2 on port 3010:
```bash
cd /var/www/farmlink/apps/web
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
pnpm build
pm2 start ../../deploy/ecosystem.config.cjs --env production
pm2 save
```

**Frontend Console Output:**
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Environments: .env.local
```

**Backend Console Output:**
```
[Nest] 12345  - 01/15/2025, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
NestJS API running on http://localhost:3001
```

## What's Next

### Phase 1 Priority (This Week):
1. ✅ Project scaffold & setup
2. → Implement Farms CRUD endpoints
3. → Implement Listings marketplace
4. → Add Paystack subscription integration
5. → Build Harvest Investment Marketplace
6. → Integrate Google Gemini AI (Crop Doctor)
7. → Build Retailer Demand Requests system

### Key Files to Review

**Frontend**
- `apps/web/app/page.tsx` - Home page
- `apps/web/app/layout.tsx` - Layout setup
- `apps/web/tailwind.config.ts` - Tailwind configuration

**Deployment**
- `deploy/ecosystem.config.cjs` - PM2 config for the frontend
- `deploy/nginx.conf` - Reverse proxy for `app.` and `api.` subdomains

**Backend**
- `apps/api/src/auth/` - Authentication module
- `apps/api/src/main.ts` - Entry point
- `apps/api/prisma/schema.prisma` - Database schema

**Shared**
- `packages/shared-types/index.ts` - Type definitions
- `packages/validation/index.ts` - Zod validation schemas

## Common Commands

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev:web         # Start only frontend
pnpm dev:api         # Start only backend

# Building
pnpm build            # Build all apps
pnpm build:web       # Build only frontend
pnpm build:api       # Build only backend

# Database
cd apps/api
pnpm prisma:push     # Apply schema changes
pnpm prisma:studio   # Open Prisma Studio GUI
pnpm prisma:seed     # Seed database

# Code Quality
pnpm lint            # Run ESLint on all apps
pnpm type-check      # TypeScript check
pnpm test            # Run tests

# Formatting
pnpm format          # Format code with Prettier
```

## Environment Configuration

The `.env` file is already created with placeholders. Get API keys from:

1. **Paystack** (Payment Processing)
   - Go to https://dashboard.paystack.com
   - Get your `sk_test_*` and `pk_test_*` keys

2. **Google Gemini API** (AI Crop Doctor)
   - Go to https://aistudio.google.com
   - Get your API key

3. **Cloudflare R2** (Image Storage)
   - Go to https://dash.cloudflare.com
   - Create R2 bucket and get access keys

4. **Resend** (Email Service)
   - Go to https://resend.com
   - Get API key

5. **Africa's Talking** (SMS Service)
   - Go to https://africastalking.com
   - Get API credentials

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :3001  # Backend

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U farmlink -d farmlink -h localhost
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -r node_modules pnpm-lock.yaml
pnpm install
```

## Project Structure Reference

```
farmlink/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # App Router structure
│   │   ├── components/      # React components
│   │   └── lib/             # Client utilities
│   │
│   └── api/                 # NestJS backend
│       ├── src/
│       │   ├── auth/        # Authentication
│       │   ├── farms/       # Farms CRUD
│       │   ├── listings/    # Product listings
│       │   └── ...more modules
│       ├── prisma/          # Database schema
│       └── test/            # Tests
│
├── packages/
│   ├── shared-types/        # Type definitions
│   └── validation/          # Zod schemas
│
└── docker/                  # Docker configuration
```

## Next Steps

1. **Set up PostgreSQL** (Docker or local)
2. **Initialize database** with `pnpm prisma:push`
3. **Start dev servers** with `pnpm dev`
4. **Open browser**: http://localhost:3000

Then start building:
- Create endpoints in `apps/api/src/`
- Create pages in `apps/web/app/`
- Use shared types from `packages/shared-types/`

Good luck! 🚀
