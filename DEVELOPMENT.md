# FarmLink Development Guide

## Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\stepp\Downloads\Programs\ENT
pnpm install
```

### 2. Start Development Server
```bash
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:3001 (NestJS)

## Project Structure

```
farmlink/
├── apps/
│   ├── web/              # Next.js 14 Frontend
│   │   ├── app/          # App Router (pages)
│   │   ├── components/   # React Components
│   │   │   └── navbar.tsx
│   │   ├── lib/          # Client utilities
│   │   ├── public/       # Static assets
│   │   ├── styles/       # Global CSS
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/              # NestJS Backend
│       ├── src/
│       │   ├── auth/     # Authentication (JWT, Register, Login)
│       │   ├── prisma/   # Database service
│       │   ├── main.ts   # Entry point
│       │   └── app.module.ts
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       ├── test/
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared-types/     # TypeScript Type Definitions
│   │   └── index.ts
│   │
│   └── validation/       # Zod Validation Schemas
│       └── index.ts
│
├── docker/               # Docker Configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── nginx.conf
│
├── scripts/
│   └── dev.bat          # Quick dev script
│
├── .github/
│   └── workflows/       # GitHub Actions
│       └── ci.yml
│
└── Configuration Files
    ├── pnpm-workspace.yaml
    ├── turbo.json
    ├── .eslintrc.json
    ├── .prettierrc
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── package.json
```

## Frontend Development (Next.js)

### Creating Pages
Pages go in `apps/web/app/` following the App Router pattern:

```
apps/web/app/
├── page.tsx           # / (home)
├── layout.tsx         # Root layout
└── (auth)/
    ├── login/
    │   └── page.tsx   # /auth/login
    └── register/
        └── page.tsx   # /auth/register
```

### Creating Components
Store reusable components in `apps/web/components/`:

```typescript
// apps/web/components/button.tsx
export function Button({ children, ...props }) {
  return (
    <button className="px-4 py-2 bg-green-600 text-white rounded" {...props}>
      {children}
    </button>
  )
}
```

Then import and use:
```typescript
import { Button } from '@/components/button'

export default function Page() {
  return <Button>Click me</Button>
}
```

### Styling with Tailwind CSS
All styling is done with Tailwind classes. Configuration in `apps/web/tailwind.config.ts`.

```typescript
<div className="flex gap-4 p-8 bg-green-600 text-white rounded-lg">
  <h1 className="text-2xl font-bold">Hello</h1>
</div>
```

### Using Shared Types
Import types from the shared package:

```typescript
import type { Profile, Campaign } from '@farmlink/shared-types'

const user: Profile = {
  id: '1',
  role: 'FARMER',
  fullName: 'John Doe',
  // ...
}
```

### Using Shared Validation
Import validation schemas:

```typescript
import { RegisterSchema, type RegisterInput } from '@farmlink/validation'

const input: RegisterInput = {
  email: 'farmer@example.com',
  password: 'secure123',
  fullName: 'John Farmer',
  role: 'FARMER',
}

const result = RegisterSchema.parse(input)
```

## Backend Development (NestJS)

### Project Structure
```
apps/api/src/
├── auth/                # Auth module
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.guard.ts
├── prisma/              # Database
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── [feature]/           # Add more modules here
│   ├── [feature].module.ts
│   ├── [feature].service.ts
│   ├── [feature].controller.ts
│   └── [feature].dto.ts
├── app.module.ts
└── main.ts
```

### Creating a New Module
```bash
cd apps/api
npx nest g module farms
npx nest g controller farms
npx nest g service farms
```

This creates:
- `src/farms/farms.module.ts`
- `src/farms/farms.controller.ts`
- `src/farms/farms.service.ts`

### Creating an Endpoint
```typescript
// apps/api/src/farms/farms.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { FarmsService } from './farms.service'

@Controller('farms')
export class FarmsController {
  constructor(private farmsService: FarmsService) {}

  @Post()
  create(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.create(createFarmDto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id)
  }
}
```

### Using Prisma
```typescript
// apps/api/src/farms/farms.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FarmsService {
  constructor(private prisma: PrismaService) {}

  create(data) {
    return this.prisma.farm.create({ data })
  }

  findOne(id: string) {
    return this.prisma.farm.findUnique({
      where: { id },
      include: { listings: true }
    })
  }
}
```

## Database Management (Prisma)

### View Database (Prisma Studio)
```bash
cd apps/api
pnpm prisma studio
```

Opens GUI at http://localhost:5555

### Create a Migration
After modifying `schema.prisma`:

```bash
cd apps/api
pnpm prisma migrate dev --name add_new_field
```

### Apply Migrations
```bash
cd apps/api
pnpm prisma migrate deploy
```

### Reset Database
```bash
cd apps/api
pnpm prisma migrate reset
```

## Code Quality

### Format Code
```bash
pnpm format
```

### Check TypeScript
```bash
pnpm type-check
```

### Run Linter
```bash
pnpm lint
```

### Run Tests
```bash
pnpm test
```

## Common Tasks

### Add a new package dependency
```bash
pnpm add package-name
pnpm add -D package-name  # Dev dependency
```

### Add dependency to specific app
```bash
cd apps/web
pnpm add package-name
```

### View what's being served
```bash
# Check frontend
curl http://localhost:3000

# Check backend
curl http://localhost:3001/health
```

## Environment Variables

See `.env` file in project root. Key variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=your-key
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

## Debugging

### VS Code Debug Configuration
Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "NestJS Debug",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

Then start backend with:
```bash
cd apps/api
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/nest start
```

### Check Running Processes
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

## Troubleshooting

### Port already in use
```bash
# Find and kill process using the port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module not found errors
```bash
# Reinstall dependencies
rm -r node_modules pnpm-lock.yaml
pnpm install
```

### Next.js build errors
```bash
cd apps/web
pnpm build
# Check error messages
```

### Prisma issues
```bash
cd apps/api
pnpm prisma generate
```

## Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/farm-listings
```

### Commit Changes
```bash
git add .
git commit -m "feat: add farm listings CRUD"
```

### Push to GitHub
```bash
git push origin feature/farm-listings
```

## Useful Commands Reference

```bash
# Development
pnpm dev              # Start all servers
pnpm dev:web         # Start only frontend
pnpm dev:api         # Start only backend

# Building
pnpm build            # Build all
pnpm build:web       # Build frontend
pnpm build:api       # Build backend

# Database
pnpm prisma:push     # Apply schema
pnpm prisma:studio   # Open UI

# Code Quality
pnpm lint            # Lint all
pnpm format          # Format all
pnpm type-check      # TypeScript check
pnpm test            # Run tests

# Clean
pnpm clean           # Remove build files
```

## Architecture Notes

- **Monorepo**: Single repository with multiple apps (web, api, packages)
- **Type Safety**: Full TypeScript everywhere (frontend, backend, shared)
- **Validation**: Zod for runtime validation at API boundaries
- **Database**: Prisma ORM with PostgreSQL
- **Real-time**: Socket.io for WebSocket communication
- **API Style**: RESTful with JSON
- **Authentication**: JWT tokens, stored in HTTP-only cookies

## Next Steps

1. Review the plan: `CLAUDE.md`
2. Start building features (see Phase 1 in plan)
3. Implement Farms CRUD
4. Implement Listings marketplace
5. Add authentication UI
