# GitHub-like Platform (MERN/TS)

A scalable platform inspired by GitHub with Git storage, CI/CD, webhooks, queues, and code search capabilities.

## Features

- **Git Storage**: Full Git repository management using nodegit
- **CI/CD Pipelines**: Automated build/test/deploy pipelines using BullMQ queues
- **Webhooks**: HTTP callbacks for repository events
- **Real-time Updates**: Socket.io for live collaboration
- **Code Search**: Full-text search across repositories
- **User Authentication**: JWT-based secure authentication
- **Repository Management**: Create, clone, fork, and manage repositories
- **Commit History**: View and browse commit history
- **File Browser**: Navigate repository structure
- **Code Editor**: Integrated Monaco editor for code viewing/editing

## Architecture

### Backend (Node.js/TypeScript/Express)
- RESTful API for all operations
- MongoDB for metadata storage (users, repositories, etc.)
- Native Git storage using nodegit library
- Redis-backed BullMQ queues for asynchronous processing
- Socket.io for real-time webhook delivery and notifications
- Modular service architecture (GitService, CiCdService, WebhookService, CodeSearchService)

### Frontend (React/TypeScript/Vite)
- Modern React 18 with hooks
- Redux for state management
- React Router for navigation
- Monaco Editor for code editing
- Socket.io client for real-time updates
- Responsive design with CSS modules

## Tech Stack

### Backend
- Node.js 18+
- TypeScript
- Express.js
- MongoDB + Mongoose
- Redis + BullMQ
- Socket.io
- nodegit (Git library)
- JWT authentication
- zod validation

### Frontend
- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Monaco Editor
- Socket.io client
- Axios

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- Git

### Installation
1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Create `.env` files in both backend and frontend directories
5. Start MongoDB and Redis services
6. Start backend: `cd backend && npm run dev`
7. Start frontend: `cd frontend && npm run dev`

### Environment Variables
Backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gitplatform
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Repositories
- GET `/api/repositories` - List repositories
- POST `/api/repositories` - Create new repository
- GET `/api/repositories/:id` - Get repository details
- POST `/api/repositories/:id/commits` - Create new commit
- GET `/api/repositories/:id/contents/:commitId/*` - Get file contents
- GET `/api/repositories/:id/search` - Search code in repository

### Webhooks
- POST `/api/webhooks` - Create webhook
- GET `/api/webhooks` - List webhooks
- DELETE `/api/webhooks/:id` - Delete webhook

### CI/CD
- POST `/api/ci-cd/pipeline` - Trigger pipeline
- GET `/api/ci-cd/status/:pipelineId` - Get pipeline status

## Design Decisions

### Git Storage
Uses nodegit for native Git operations, ensuring full compatibility with Git protocol and tools.

### CI/CD
Uses BullMQ queues for reliable job processing with retry mechanisms and monitoring.

### Webhooks
Combines Socket.io for real-time delivery with HTTP endpoints for external integrations.

### Code Search
Performs on-the-fly search through Git history using nodegit tree traversal.

## Future Enhancements

- Pull requests and code reviews
- Issue tracking and project boards
- GitHub Actions compatibility
- Package registry
- Security scanning
- Performance analytics
- AI-powered code assistance

## License

MIT
