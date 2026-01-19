# ERT Inspection - replit.md

## Overview

ERT Inspection is a digital inspection and safety equipment management platform for Emergency Response Teams (ERT). The application enables field personnel to conduct various safety inspections including P2H (Pre-use Checks), APAR (Fire Extinguisher), and Hydrant inspections. It features an AI-powered chat assistant for safety insights, QR code scanning for equipment identification, PDF report generation, and a scheduling system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6 for fast development and bundling
- **Styling**: Tailwind CSS loaded via CDN with custom theme configuration in `index.html`
- **Routing**: Custom screen-based navigation using React state (no router library)
- **State Management**: Local component state with useState hooks

The frontend follows a screen-based architecture where `App.tsx` manages navigation state and renders the appropriate screen component. Components are organized into:
- `/screens` - Full page views (Home, Login, Inspection forms, etc.)
- `/components` - Reusable UI components (Button, Card, Input, etc.)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript executed with tsx
- **API Pattern**: RESTful endpoints under `/api/*`
- **Port Configuration**: Frontend on 3000, Backend on 3001 with Vite proxy

The backend handles authentication, CRUD operations for inspections, AI chat integration, and scheduling. All API routes are defined in `server/index.ts`.

### Database Layer
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL via Neon serverless
- **Schema Location**: `server/schema.ts`
- **Migrations**: Managed via drizzle-kit (`drizzle.config.ts`)

Schema includes tables for:
- `users` - Authentication and user management
- `p2hInspections` - Pre-use check records
- `aparInspections` - Fire extinguisher inspection records
- `hydrantInspections` - Hydrant inspection records
- `chatLogs` - AI conversation history
- `schedules` - Inspection scheduling
- `picaReports` - Problem identification and corrective action reports

### AI Integration
- **Primary**: OpenAI API for chat functionality (backend)
- **Secondary**: Google Gemini API for safety insights (frontend service)

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Via `@neondatabase/serverless` package
- **Environment Variable**: `DATABASE_URL` required

### AI Services
- **OpenAI API**: Used for chat assistant in backend
- **Google Gemini API**: Used for safety insights in frontend
- **Environment Variables**: `GEMINI_API_KEY` required

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express` - Backend web framework
- `html5-qrcode` - QR code scanning functionality
- `jspdf` / `jspdf-autotable` - PDF report generation
- `date-fns` - Date formatting utilities
- `lucide-react` - Icon library

### Development Tools
- `tsx` - TypeScript execution for backend
- `vite` - Frontend build and dev server
- `@vitejs/plugin-react` - React support for Vite