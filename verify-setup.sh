#!/bin/bash

echo "🔍 FarmLink Setup Verification"
echo "=============================="
echo ""

# Check Node.js
echo "✓ Node.js version:"
node --version

# Check npm
echo "✓ npm version:"
npm --version

# Check pnpm
echo "✓ pnpm version:"
pnpm --version

# Check project structure
echo ""
echo "✓ Project directories:"
[ -d "apps/web" ] && echo "  ✓ apps/web (Next.js frontend)" || echo "  ✗ apps/web (MISSING)"
[ -d "apps/api" ] && echo "  ✓ apps/api (NestJS backend)" || echo "  ✗ apps/api (MISSING)"
[ -d "packages/shared-types" ] && echo "  ✓ packages/shared-types" || echo "  ✗ packages/shared-types (MISSING)"
[ -d "packages/validation" ] && echo "  ✓ packages/validation" || echo "  ✗ packages/validation (MISSING)"

# Check files
echo ""
echo "✓ Key files:"
[ -f "package.json" ] && echo "  ✓ package.json" || echo "  ✗ package.json (MISSING)"
[ -f ".env" ] && echo "  ✓ .env" || echo "  ✗ .env (MISSING)"
[ -f "pnpm-workspace.yaml" ] && echo "  ✓ pnpm-workspace.yaml" || echo "  ✗ pnpm-workspace.yaml (MISSING)"
[ -f "turbo.json" ] && echo "  ✓ turbo.json" || echo "  ✗ turbo.json (MISSING)"

# Check dependencies
echo ""
echo "✓ Dependencies status:"
if [ -d "node_modules" ]; then
  echo "  ✓ node_modules exists"
  [ -d "node_modules/next" ] && echo "    ✓ next installed" || echo "    ✗ next (MISSING)"
  [ -d "node_modules/@nestjs/core" ] && echo "    ✓ @nestjs/core installed" || echo "    ✗ @nestjs/core (MISSING)"
else
  echo "  ✗ node_modules (NOT FOUND)"
fi

echo ""
echo "✓ Git status:"
git status --short | head -5 || echo "  Not a git repo"

echo ""
echo "=============================="
echo "To start development:"
echo "  npm run dev"
echo ""
