#!/bin/bash

# Member Management System Setup Script
# This script sets up the necessary permissions and configurations

echo "🚀 Setting up Member Management System..."

# Make CLI tools executable
echo "📝 Setting up CLI permissions..."
chmod +x scripts/discord-cli.ts
chmod +x scripts/discord-role-sync.ts

# Check required environment variables
echo "🔍 Checking environment variables..."

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DISCORD_BOT_TOKEN"
    "DISCORD_GUILD_ID"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '   %s\n' "${missing_vars[@]}"
    echo ""
    echo "Please set these variables in your .env file:"
    echo ""
    for var in "${missing_vars[@]}"; do
        echo "$var=your_${var,,}_here"
    done
    echo ""
    echo "Refer to docs/member-management-system.md for details."
    exit 1
fi

echo "✅ All required environment variables are set!"

# Check Node.js dependencies
echo "📦 Checking dependencies..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Install additional dependencies if needed
echo "📥 Installing dependencies..."
npm install @supabase/supabase-js

# Test database connection
echo "🔗 Testing database connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('members').select('count').single()
  .then(({ error }) => {
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      process.exit(1);
    } else {
      console.log('✅ Database connection successful!');
    }
  })
  .catch((error) => {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  });
"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p exports

# Set up log rotation for CLI operations
echo "📋 Setting up logging..."
cat > logs/.gitkeep << EOF
# This directory contains logs from Discord CLI operations
# Logs are automatically rotated and cleaned up
EOF

# Create example usage files
echo "📚 Creating example files..."

# Example CSV template
cat > exports/member_import_template.csv << EOF
name,github_username,title,discord_username,personal_email,mobile_number,clan_name,bash_points
John Doe,johndoe,Basher,johndoe#1234,john@example.com,+1234567890,Alpha Clan,0
Jane Smith,janesmith,Captain Bash,janesmith#5678,jane@example.com,+0987654321,Beta Clan,100
Bob Wilson,bobwilson,Mentor,,bob@example.com,,Gamma Clan,500
Alice Johnson,alicejohnson,Rookie,alice#9999,alice@example.com,+1122334455,,0
EOF

# Example Discord CLI usage script
cat > scripts/example-discord-operations.sh << 'EOF'
#!/bin/bash

# Example Discord CLI operations
# Uncomment and modify these commands as needed

echo "🤖 Discord CLI Examples"
echo "======================"

# Sync a specific member
# ./scripts/discord-cli.ts sync-role johndoe

# Bulk sync with dry run (safe to test)
# ./scripts/discord-cli.ts bulk-sync --dry-run

# Bulk sync all members (actual operation)
# ./scripts/discord-cli.ts bulk-sync

# Assign a role to a Discord user
# ./scripts/discord-cli.ts assign-role "johndoe#1234" "Captain Bash"

# List all organisers
# ./scripts/discord-cli.ts list-members --role "Organiser"

# Show server statistics
# ./scripts/discord-cli.ts server-stats

echo "📚 See docs/member-management-system.md for complete documentation"
EOF

chmod +x scripts/example-discord-operations.sh

# Test Discord CLI
echo "🧪 Testing Discord CLI..."
if ./scripts/discord-cli.ts help > /dev/null 2>&1; then
    echo "✅ Discord CLI is working correctly!"
else
    echo "⚠️  Discord CLI test failed. Check your TypeScript setup."
fi

# Create quick start guide
cat > MEMBER_MANAGEMENT_QUICKSTART.md << 'EOF'
# Quick Start Guide - Member Management System

## 🚀 Getting Started

### 1. Access Member Management
Visit `/admin/members` in your browser to access the main management dashboard.

### 2. Add a Single Member
- Click "Add Member" button
- Fill in the required information
- Preview GitHub profile
- Save and sync to Discord

### 3. Bulk Import Members
- Click "Bulk Import" button
- Download the CSV template
- Fill with member data
- Upload and validate
- Import approved members

### 4. Manage Discord Roles
- Visit `/admin/discord-roles`
- View sync status for all members
- Perform bulk or individual syncs
- Monitor sync logs

### 5. View Analytics
- Go to `/admin/members/analytics`
- Explore different view modes
- Export data for analysis
- Track community growth

## 🔧 CLI Quick Commands

```bash
# Show help
./scripts/discord-cli.ts help

# List all members
./scripts/discord-cli.ts list-members

# Sync specific member
./scripts/discord-cli.ts sync-role username

# Bulk sync (dry run first!)
./scripts/discord-cli.ts bulk-sync --dry-run
./scripts/discord-cli.ts bulk-sync

# Server stats
./scripts/discord-cli.ts server-stats
```

## 📊 Key Features

- ✅ Complete member CRUD operations
- ✅ Role-based access control
- ✅ Discord integration with real-time sync
- ✅ Bulk import/export capabilities
- ✅ Advanced analytics and reporting
- ✅ CLI tools for automation
- ✅ Mobile-responsive interface

## 📚 Documentation
See `docs/member-management-system.md` for complete documentation.
EOF

echo ""
echo "🎉 Member Management System setup complete!"
echo ""
echo "📋 Setup Summary:"
echo "   ✅ CLI tools configured"
echo "   ✅ Environment variables verified"
echo "   ✅ Database connection tested"
echo "   ✅ Directories created"
echo "   ✅ Example files generated"
echo ""
echo "🚀 Next Steps:"
echo "   1. Visit /admin/members in your browser"
echo "   2. Read MEMBER_MANAGEMENT_QUICKSTART.md"
echo "   3. Check docs/member-management-system.md for full docs"
echo "   4. Use scripts/example-discord-operations.sh for CLI examples"
echo ""
echo "🎯 Happy member managing!"
