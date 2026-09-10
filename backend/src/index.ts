import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import repositoryRoutes from './routes/repository';
import webhookRoutes from './routes/webhook';
import ciCdRoutes from './routes/ciCd';
import searchRoutes from './routes/search';
import { initializeQueues } from './services/queueService';
import { startWebhookService } from './services/webhookService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Initialize queues (BullMQ)
initializeQueues();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/ci-cd', ciCdRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Start webhook service
startWebhookService(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
