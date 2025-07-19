#!/bin/bash

# ByteBashBlitz Terminal - Developer Setup Script
# This script helps new contributors set up their development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "🚀 ByteBashBlitz Terminal - Developer Setup"
    echo "==========================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    print_step "Checking requirements..."
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 20 ]; then
            print_success "Node.js $(node --version) installed"
        else
            print_error "Node.js 20+ required. Current version: $(node --version)"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 20+"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        print_success "npm $(npm --version) installed"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check git
    if command -v git >/dev/null 2>&1; then
        print_success "Git $(git --version | cut -d' ' -f3) installed"
    else
        print_error "Git not found. Please install Git"
        exit 1
    fi
}

setup_environment() {
    print_step "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
            print_warning "Please update .env with your Supabase and GitHub OAuth credentials"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
}

install_dependencies() {
    print_step "Installing dependencies..."
    
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

run_checks() {
    print_step "Running development checks..."
    
    # TypeScript check
    echo "Checking TypeScript..."
    if npm run typecheck >/dev/null 2>&1; then
        print_success "TypeScript check passed"
    else
        print_warning "TypeScript check failed - there are known issues (86 errors)"
        print_warning "The app still builds and runs, but consider fixing these for better DX"
    fi
    
    # Lint check
    echo "Checking ESLint..."
    if npm run lint >/dev/null 2>&1; then
        print_success "ESLint check passed"
    else
        print_warning "ESLint issues found - run 'npm run lint:fix' to auto-fix"
    fi
    
    # Build check
    echo "Testing build..."
    if npm run build >/dev/null 2>&1; then
        print_success "Build successful"
        rm -rf build # Clean up build artifacts
    else
        print_error "Build failed"
        exit 1
    fi
}

setup_git_hooks() {
    print_step "Setting up Git hooks..."
    
    # Create pre-commit hook
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check TypeScript
npm run typecheck
if [ $? -ne 0 ]; then
    echo "TypeScript check failed"
    exit 1
fi

# Check linting
npm run lint
if [ $? -ne 0 ]; then
    echo "ESLint check failed"
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
}

display_next_steps() {
    echo -e "${GREEN}"
    echo "🎉 Setup Complete!"
    echo "=================="
    echo -e "${NC}"
    
    echo "Next steps:"
    echo "1. Update .env with your credentials:"
    echo "   - Supabase URL and anon key"
    echo "   - GitHub OAuth client ID and secret"
    echo ""
    echo "2. Set up database:"
    echo "   - Create Supabase project"
    echo "   - Run SQL migrations from supabase/migrations/"
    echo ""
    echo "3. Start development:"
    echo "   npm run dev"
    echo ""
    echo "4. Available commands:"
    echo "   npm run dev          # Start development server"
    echo "   npm run build        # Build for production"
    echo "   npm run typecheck    # Check TypeScript"
    echo "   npm run lint         # Run ESLint"
    echo "   npm run lint:fix     # Fix ESLint issues"
    echo "   npm run format       # Format code with Prettier"
    echo ""
    echo "5. Read the documentation:"
    echo "   - README.md - Project overview"
    echo "   - CONTRIBUTING.md - Contributing guidelines"
    echo "   - docs/ - Additional documentation"
    echo ""
    echo "🔗 Live site: https://terminal.bytebashblitz.org"
    echo "📚 Docs: Check the /docs folder"
    echo "💬 Issues: Use GitHub Issues for questions"
    echo ""
    echo "Happy coding! 🚀"
}

# Main execution
main() {
    print_header
    check_requirements
    setup_environment
    install_dependencies
    run_checks
    setup_git_hooks
    display_next_steps
}

# Run main function
main
