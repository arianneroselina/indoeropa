# INDO EROPA

A website built for INDO EROPA transport service.

## Live Demo
- https://indo-eropa.vercel.app

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Multer
- Notion API

## Requirements
- Node.js 18+ (recommended)
- npm

## Project Structure

```bash
indoeropa/
├── client/   # React frontend
└── server/   # Express backend
```

## Getting Started

### Frontend Setup

#### 1) Go to the client folder
```bash
cd client
```

#### 2) Install dependencies
```bash
npm install
```

#### 3) Run locally
```bash
npm start
```
or just run this from the root folder:
```bash
make run
```

Open: `http://localhost:3000`.

#### 4) Build for production
```bash
npm run build
```

### Backend Setup

#### 1) Go to the server folder
```bash
cd server
```

#### 2) Install dependencies
```bash
npm install
```

#### 3) Create environment variables

Create a `.env` file in `server/` and do not commit it:

```dotenv
NOTION_API_TOKEN=...
NOTION_DB_PENERIMAAN_BARANG=...
NOTION_DB_PEMBAYARAN=...
NOTION_DB_PENGIRIMAN_LOKAL=...
```

#### 4) Run locally
```bash
npm start
```
or just run this from the root folder:
```bash
make server
```

The backend runs on: `http://localhost:3001`.