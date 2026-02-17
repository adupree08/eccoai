# eccoai

AI-powered LinkedIn content creation that echoes your authentic voice.

## Features

- **AI Content Generation** - Transform ideas, URLs, or RSS feeds into polished LinkedIn posts
- **Brand Voice Training** - Teach AI your unique writing style
- **Custom RSS Feeds** - Curate content sources for endless inspiration
- **Content Calendar** - Plan and schedule your posts visually

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude (Anthropic)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eccoai
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Google OAuth in Authentication > Providers (optional)
4. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Set these in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login/Signup pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   └── page.tsx         # Landing page
├── components/          # UI components
├── hooks/               # React hooks
└── lib/
    ├── prompts/         # AI system prompts
    └── supabase/        # Supabase clients
```

## License

MIT
