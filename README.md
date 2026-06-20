# Vivid Advisory — Land Marketplace Platform

## Project Structure
```
vivid-advisory/
├── frontend/          # React app (port 3000)
│   └── src/
│       ├── components/    # Shared UI components
│       ├── pages/         # Route-level pages
│       ├── context/       # Auth & App state
│       ├── hooks/         # Custom React hooks
│       └── utils/         # API helpers, constants
└── backend/           # Node.js/Express API (port 5000)
    ├── src/
    │   ├── routes/        # API route handlers
    │   ├── models/        # DB query functions
    │   ├── middleware/     # Auth, rate limit, upload
    │   └── services/      # News, verification, matching
    └── migrations/        # PostgreSQL schema files
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Environment Variables

Create `backend/.env`:
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/vivid_advisory
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Install & Run

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Database
Run `backend/migrations/001_schema.sql` against your PostgreSQL instance.

## Roles
1. **Aggregator** — lists land parcels, uploads due diligence
2. **Investor** — browses, funds acquisitions, co-ownership
3. **Developer** — acquires, develops, lists industrial/commercial parks
4. **Buyer/Tenant** — searches, posts requirements, finalizes deals
5. **Consultant (IPC)** — connects buyers with aggregators/developers

## Key Features
- Survey number verification against government portals
- CDP zone check & color coding
- Litigation & encumbrance check
- AI-based matchmaking (buyer requirements ↔ listings)
- Field executive assignment for discrepancy tickets
- Real-time news feed (Karnataka land news only)
- 2% success fee on completed transactions
- Revenue popups: legal, financial, licensing, conversion services
