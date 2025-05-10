import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/config';
import phoneRouter from './routes/phoneRoutes';
import bankRouter from './routes/bankRoutes';
import authRouter from './routes/authroutes';
import debtRouter from './routes/debtRoutes';
import paystackRoutes from './routes/paystackRoutes';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoute'

import { swaggerUi, swaggerSpec } from './docs/swagger';
import { connectRedis } from './config/redis';

(async () => {
  await connectRedis();

  const app = express();

  // Connect to MongoDB
  mongoose.connect(config.mongo.url as string)
    .then(() => console.log('Connected to Database'))
    .catch((error) => console.log('Database connection error', error));

  
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_ORIGIN // e.g. https://gbese.vercel.app
  ].filter(Boolean); 

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 'loopback');

  // Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: true,
      message: 'Server is running smoothly',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Endpoints
  app.use('/api/v1', phoneRouter);
  app.use('/api/v2', authRouter);
  app.use('/api/v3', bankRouter);
  app.use('/api/v4', debtRouter);
  app.use('/api/v5', userRoutes);
  app.use('/api/v6', activityRoutes);
  app.use('/api/paystack', paystackRoutes);


  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.listen(config.server.port, () => {
    console.log(`🚀 Server running on port ${config.server.port}`);
  });
})();
