# Academic Recipe Hub

A professional full-stack application for managing recipes, featuring a React/Vite frontend and a .NET Core API backend.

## Structure
- `/frontend`: Vite + React + Tailwind CSS
- `/backend`: .NET Core API
- `/backend/Database`: SQL Migration and Schema scripts

## Getting Started

### Prerequisites
- Node.js (v18+)
- .NET SDK (v8+)
- SQL Server

### Installation
From the root directory, run:
```bash
npm run install:all
```

### Running Locally

#### Frontend
```bash
npm run dev:frontend
```

#### Backend
```bash
npm run dev:backend
```

## Deployment
This project is structured as a monorepo for easy deployment.
- **Frontend**: Deploy the `frontend/` folder to platforms like Vercel or Netlify.
- **Backend**: Deploy the `backend/RecipeAPI` project to Azure App Service or similar.
