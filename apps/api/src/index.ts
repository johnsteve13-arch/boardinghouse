import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import boardingHouseRoutes from './routes/boardingHouse.routes';
import inquiryRoutes from './routes/inquiry.routes';
import reviewRoutes from './routes/review.routes';
import comparisonRoutes from './routes/comparison.routes';
import recommendationRoutes from './routes/recommendation.routes';
import favoriteRoutes from './routes/favorite.routes';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';

const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Render Health Check endpoint (Requirement 49)
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'healthy',
    service: 'seait-stay-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    seaitAnchor: {
      campus: 'South East Asian Institute of Technology (SEAIT)',
      location: 'National Highway, Purok 7, Crossing Rubber, Tupi, South Cotabato',
      coordinates: { lat: 6.3648, lon: 124.9222 }
    }
  });
});

// API Root
app.get('/api', (_req, res) => {
  return res.json({
    name: 'SEAIT Stay API',
    version: '1.0.0',
    description: 'Premier Boarding House Information & Finder System for SEAIT, Tupi, South Cotabato',
    documentation: '/api/docs'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/boarding-houses', boardingHouseRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/compare', comparisonRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Handler
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SEAIT Stay API] Server running on port ${PORT}`);
    console.log(`[SEAIT Stay API] Health check at http://localhost:${PORT}/health`);
  });
}

export default app;
