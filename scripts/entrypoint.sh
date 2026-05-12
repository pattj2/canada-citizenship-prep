#!/bin/sh
set -e

echo ""
echo "🍁 =================================================="
echo "🍁  Canada Citizenship Prep — Container Startup"
echo "🍁 =================================================="
echo ""

# Apply schema: use migrations when present, otherwise push schema directly.
echo "🔄 Applying database schema..."
if [ -d "prisma/migrations" ] && [ "$(find prisma/migrations -mindepth 1 -maxdepth 1 | wc -l)" -gt 0 ]; then
	echo "📦 Migrations detected; running prisma migrate deploy"
	npx prisma migrate deploy
else
	echo "🛠️  No migrations found; running prisma db push"
	npx prisma db push --skip-generate
fi
echo "✅ Schema ready."

# Seed the database (idempotent — skips if already seeded)
echo "🌱 Seeding database..."
npx prisma db seed
echo "✅ Seed complete."

echo ""
echo "🚀 Starting Next.js (http://localhost:3000) ..."
echo "📊 Adminer DB viewer at    http://localhost:8080"
echo "   server=postgres | user=postgres | pass=postgres | db=citizenprep"
echo ""

exec npm run dev
