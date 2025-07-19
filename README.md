# 🏆 ByteBashBlitz Terminal - Community Leaderboard Platform

[![Live Site](https://img.shields.io/badge/Live-terminal.bytebashblitz.org-brightgreen)](https://terminal.bytebashblitz.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Remix](https://img.shields.io/badge/Remix-000000?logo=remix&logoColor=white)](https://remix.run/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

A gamified community platform for coders to track progress, participate in events, form clans, and showcase projects.

## 🚀 **Live Platform**
Visit: **[terminal.bytebashblitz.org](https://terminal.bytebashblitz.org)**

## ✨ **Features**

### **For Community Members**
- 👥 **GitHub OAuth Login** - Seamless authentication
- 🏆 **Leaderboard System** - Points-based ranking with tiers
- 📅 **Event Management** - Join WeeklyBash and community events
- 🏰 **Clan System** - Form teams and compete together
- 🎯 **Project Showcase** - Present your projects with slot allocation
- 📱 **PWA Support** - Install as mobile app
- 🔔 **Push Notifications** - Real-time updates

### **For Organizers**
- 📊 **Member Management** - Add/edit profiles and points
- 📅 **Event Creation** - Schedule and manage community events
- 🏰 **Clan Administration** - Manage clan scores and activities
- 🎤 **Showcase Management** - Allocate presentation slots
- 📢 **Announcements** - Send community notifications

## 🛠️ **Tech Stack**

- **Framework**: Remix v2 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: GitHub OAuth via Remix Auth
- **Styling**: Tailwind CSS + Radix UI
- **Animations**: Framer Motion
- **Deployment**: Render
- **PWA**: Vite PWA Plugin

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20+
- GitHub account
- Supabase account

### **Development Setup**

1. **Clone the repository**
```bash
git clone https://github.com/bennyhinn18/remix-leaderboard.git
cd remix-leaderboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Fill in your Supabase and GitHub OAuth credentials
```

4. **Set up database**
```bash
# Run all SQL migrations in supabase/migrations/ in your Supabase dashboard
```

5. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 **Project Structure**

```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix)
│   ├── events/         # Event-related components
│   ├── leaderboard/    # Leaderboard components
│   └── project-showcase/ # Project showcase components
├── routes/             # Remix routes (pages + API)
├── services/           # External API integrations
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── contexts/           # React contexts

supabase/
└── migrations/         # Database schema migrations

public/                 # Static assets
scripts/               # Utility scripts
docs/                  # Documentation
```

### Database Management

This project uses Supabase for the database. We have comprehensive tools for managing schema changes:

```bash
# Check for schema differences
npm run db:check

# Create migration for changes made in Supabase
npm run db:create-migration "describe_your_changes"

# Generate TypeScript types from database
npm run types:generate

# Full sync workflow help
npm run db:sync
```

**Important**: If you make changes directly in Supabase's SQL editor, follow our [Database Workflow Guide](docs/database-workflow.md) to sync them with the codebase.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

## 🗄️ **Database Schema**

Key tables:
- `members` - User profiles and stats
- `events` - Community events
- `clans` - Team organization
- `points` - Points history tracking
- `project_showcase_slots` - Project presentation slots
- `notifications` - Real-time notifications

See `supabase/migrations/` for complete schema.

## 🤝 **Contributing**

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 **Roadmap**

- [ ] Fix TypeScript compilation errors
- [ ] Add comprehensive testing suite
- [ ] Implement email notifications
- [ ] Add calendar integration
- [ ] Create mobile app with React Native
- [ ] Add more gamification features

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/bennyhinn18/remix-leaderboard/issues)
- **Documentation**: Check `/docs` folder
- **Community**: Join our Discord server

---

**Built with ❤️ for the ByteBashBlitz community**

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
