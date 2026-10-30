# Birthday Wish

An interactive birthday greeting web app that lets you create a personalized wish link and share it with someone special.

## Features

- Create custom birthday wishes with recipient name, message, and sender name
- Shareable wish links backed by short IDs
- Animated celebration experience with confetti and background music
- Simple rate limiting for wish creation API
- Temporary wish storage with automatic expiry

## Tech Stack

- Vite
- Vanilla JavaScript
- Vercel Serverless Functions (`/api`)
- Redis for persistence and rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Redis instance (for API endpoints)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file (or set environment variables in your deployment platform):

- `REDIS_URL` - Redis connection string used by API functions

### Run Locally

```bash
npm run dev
```

Then open the local URL shown by Vite.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Endpoints

- `POST /api/create-wish` - creates a wish and returns `{ id }`
- `GET /api/get-wish?id=<id>` - fetches wish data by ID

## Deployment

This project includes `vercel.json` and is ready to deploy on Vercel.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
