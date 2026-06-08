# FarmLink Development Guide

## Project Status

**Phase**: Foundation (Week 1) - In Progress

This is a production-grade AgriTech platform connecting farmers, retailers, and investors.

## Key Files & Directories

### Frontend (Next.js)
- `apps/web/` - Main Next.js application
- `apps/web/app/` - App Router structure
- `apps/web/components/` - React components
- `apps/web/lib/` - Client-side utilities

### Backend (NestJS)
- `apps/api/` - Main NestJS application
- `apps/api/src/` - Source code
- `apps/api/prisma/schema.prisma` - Database schema
- `apps/api/src/auth/` - Authentication module

### Shared Code
- `packages/shared-types/` - TypeScript type definitions
- `packages/validation/` - Zod validation schemas

## Development Setup

### Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Set up database (PostgreSQL):
```bash
cd apps/api
pnpm run db:push
```

4. Start development servers:
```bash
pnpm dev
```

This runs:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Key Commands

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all apps
pnpm test         # Run tests
pnpm lint         # Run linter
pnpm type-check   # TypeScript check
```

## Architecture

### Monorepo with Turborepo
- `apps/web` - Next.js frontend
- `apps/api` - NestJS backend
- `packages/*` - Shared libraries

Each app is independently deployable:
- **Frontend**: Vercel
- **Backend**: Docker on DigitalOcean VPS

### Database Schema

Main entities:
- Profile (users)
- Farm, Listing
- Campaign, Investment
- DemandRequest, Bid
- Transaction (with Paystack escrow)
- Message, Notification
- Subscription, BoostRecord
- CropDiagnosis, PriceHistory
- More in `apps/api/prisma/schema.prisma`

## Current Implementation Status

### ✅ Completed
- Project structure & scaffolding
- Next.js + NestJS setup
- Prisma schema definition
- Auth module (basic JWT + Bcrypt)
- Shared types & validation
- Docker configuration
- GitHub Actions CI workflow
- Environment configuration

### 🚀 Next Steps (Phase 1)
1. Database migrations (Prisma)
2. Implement core CRUD endpoints (Farms, Listings)
3. Subscription management with Paystack
4. Real-time Socket.io gateway
5. Harvest Investment Marketplace
6. AI Crop Doctor integration (Gemini)
7. Retailer Demand Requests system

### Coming Later (Phase 2-5)
- Escrow payments & dispute system
- Trust Score calculation
- Crop Insurance Pool
- Group Buying system
- Admin dashboard
- Production hardening & security

## Coding Conventions

### File Structure
- **Components**: `CapitalCase` + `.tsx`
- **Services**: `kebab-case` + `.service.ts`
- **Modules**: `kebab-case` + `.module.ts`
- **Types**: In `packages/shared-types/index.ts`
- **Validation**: In `packages/validation/index.ts`

### TypeScript
- Strict mode enabled globally
- No `any` types (use `unknown` or generics)
- Explicit return types on functions
- Zod for runtime validation

### NestJS
- Services for business logic
- Controllers for HTTP endpoints
- Guards for authentication/authorization
- Modules for organization
- Exception filters for error handling

### Next.js
- App Router (not Pages Router)
- RSC (React Server Components) where possible
- Client components marked with `'use client'`
- TypeScript everywhere

## Git Workflow

1. Create feature branch: `git checkout -b feature/xyz`
2. Commit changes: `git commit -m "feat: description"`
3. Push: `git push origin feature/xyz`
4. Open PR for review

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `test:` Tests
- `ci:` CI/CD changes

## Environment Variables

See `.env.example` for required variables:

**Database**
- `DATABASE_URL` - PostgreSQL connection

**API**
- `JWT_SECRET` - JWT signing key
- `PORT` - Backend port (default 3001)

**Integrations**
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- `GEMINI_API_KEY`
- `R2_*` - Cloudflare R2 credentials
- `RESEND_API_KEY`
- `AFRICAS_TALKING_API_KEY`, `AFRICAS_TALKING_USERNAME`

**URLs**
- `FRONTEND_URL`
- `BACKEND_URL`

## Useful Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tech Stack
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [Socket.io](https://socket.io/docs)

## Deployment

### Frontend (Vercel)
```bash
git push origin main  # Auto-deploys
```

### Backend (Docker)
```bash
docker-compose up -d
```

See root README.md for more details.

## Support

For help:
- Check existing tests
- Review type definitions in `packages/shared-types/`
- Read validation schemas in `packages/validation/`
- Check NestJS/Next.js official docs
