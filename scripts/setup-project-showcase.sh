#!/bin/bash

# Project Showcase Setup Script
# This script sets up the Project Showcase slot allocation system

echo "🎯 Setting up Project Showcase Slot Allocation System..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Warning: Supabase CLI not found. Please install it to run migrations automatically."
    echo "   You can install it from: https://supabase.com/docs/guides/cli"
    echo ""
fi

echo "📁 Creating necessary directories..."
mkdir -p app/components/project-showcase

echo "🗄️  Database Migration"
echo "To set up the database table, run the following SQL in your Supabase dashboard:"
echo ""
echo "----------------------------------------"
cat supabase/migrations/create_project_showcase_slots_table.sql
echo "----------------------------------------"
echo ""

if command -v supabase &> /dev/null; then
    read -p "Do you want to run the migration now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Running migration..."
        supabase migration up
    fi
fi

echo "📝 Environment Variables"
echo "Make sure you have the following environment variables set:"
echo ""
echo "SUPABASE_URL=your_supabase_project_url"
echo "SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""

echo "🔧 Installing dependencies..."
if [ -f "package.json" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "⚠️  package.json not found - skipping dependency installation"
fi

echo "🎨 Building the application..."
npm run build 2>/dev/null || echo "⚠️  Build failed - you may need to fix any TypeScript errors"

echo ""
echo "✅ Project Showcase system setup complete!"
echo ""
echo "🌐 Available Routes:"
echo "   - /events/project-showcase (Main showcase page)"
echo "   - /events/project-showcase/manage (Organiser management)"
echo "   - /api/project-showcase (API endpoint)"
echo ""
echo "👥 Usage:"
echo "   1. Members with 'Basher' title can allocate slots randomly"
echo "   2. Organisers can manage slots manually via the management dashboard"
echo "   3. Maximum 25 slots available for allocation"
echo ""
echo "📚 Documentation: docs/project-showcase-system.md"
echo ""
echo "🚀 Start the development server with: npm run dev"
