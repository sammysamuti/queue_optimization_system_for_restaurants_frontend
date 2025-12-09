# QueueOpt - Restaurant Queue Optimization System (Frontend)

A Next.js-based frontend application for simulating and optimizing restaurant queue management using M/M/c queuing theory.

## Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend README)

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory and ask your team member for the `NEXT_PUBLIC_API_URL` value.

   For local development with the backend running on Docker, use:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4400/api
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- **Guest Mode**: Run simulations without authentication
- **User Dashboard**: Manage restaurants and simulations
- **Analytics**: View performance trends and detailed results
- **Real-time Charts**: Queue length visualization over time

## Project Structure

```
app/
  ├── dashboard/          # Dashboard pages
  ├── (auth)/             # Authentication pages
  └── page.tsx            # Landing page

components/
  ├── dashboard/          # Dashboard components
  └── ui/                 # Reusable UI components

lib/
  ├── api/                # API client configuration
  ├── hooks/              # Custom React hooks
  └── services/           # API service layers
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (ask your team member for the value)
  - Local development: `http://localhost:4400/api` (when backend runs on Docker)

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Zustand/React Context** - State management
