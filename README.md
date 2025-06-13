# Pranam - Next.js + Supabase Starter Template

A modern, mobile-first starter template built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Complete auth flow with Supabase
- 📱 **Mobile First** - Responsive design optimized for mobile
- 🎨 **Modern UI** - Built with shadcn/ui components
- 🚀 **Next.js 14** - App Router with Server Components
- 💾 **Supabase** - Database and authentication
- 🎯 **TypeScript** - Full type safety
- 🔒 **Protected Routes** - Middleware-based route protection

## Quick Start

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <your-repo>
   cd pranam-template
   npm install
   \`\`\`

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Rename `.env.local.example` to `.env.local`
   - Add your Supabase credentials

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

\`\`\`
├── app/
│   ├── dashboard/          # Protected dashboard pages
│   ├── login/             # Authentication page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── app-sidebar.tsx    # Dashboard sidebar
│   └── dashboard-header.tsx # Dashboard header
├── utils/
│   └── supabase/          # Supabase client configuration
└── middleware.ts          # Route protection
\`\`\`

## Pages

- **Home** (`/`) - Landing page with features overview
- **Login** (`/login`) - Authentication with sign in/up tabs
- **Dashboard** (`/dashboard`) - Protected dashboard with sidebar navigation

## Customization

### Branding
- Update the logo and brand name in components
- Modify colors in `tailwind.config.ts`
- Update metadata in `app/layout.tsx`

### Navigation
- Edit menu items in `components/app-sidebar.tsx`
- Add new dashboard pages in `app/dashboard/`

### Styling
- All styles use Tailwind CSS
- Components built with shadcn/ui
- Mobile-first responsive design

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript

## License

MIT License - feel free to use this template for your projects!
