# Chatbot Master Frontend

Multi-tenant Chatbot Management Dashboard built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form handling & validation
- **Axios** - HTTP client
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create `.env.local` file:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:

```
NEXT_PUBLIC_API_URL=https://cchatbot.pro
```

For local development, you can use:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Production Deployment

For production, the application is deployed at:
- **Frontend**: https://cchatbot.pro
- **API**: Configure `NEXT_PUBLIC_API_URL` environment variable (default: https://cchatbot.pro)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── login/             # Auth pages
│   ├── register/
│   └── app/               # Protected app routes
│       ├── select-tenant/
│       └── [tenantSlug]/  # Tenant-scoped routes
│           ├── dashboard/
│           ├── chatbots/
│           └── settings/
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── features/             # Feature-based modules (to be added)
├── lib/                  # Utilities & API
│   ├── api/              # API client & functions
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Features

- ✅ Authentication (Login/Register)
- ✅ Multi-tenant support
- ✅ Dashboard with stats
- ✅ Chatbots management (list view)
- ✅ Responsive design
- ✅ Type-safe API client
- ✅ Auto token refresh
- ✅ Error handling

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Code Quality

This project follows strict code quality rules:

- TypeScript strict mode
- No `any` types (except when absolutely necessary)
- Component size limit: 200 lines
- Function size limit: 50 lines
- ESLint + Prettier for formatting
- Feature-based folder structure

See `.cursor/rules/custom-rule.mdc` for detailed coding standards.

## API Integration

The API client automatically:
- Adds authentication headers
- Adds tenant headers (`x-tenant-slug`)
- Handles token refresh on 401
- Retries failed requests

## License

MIT
