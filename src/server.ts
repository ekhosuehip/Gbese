import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/config.ts';

const app = express()

// Connect to MongoDB
mongoose.connect(config.mongo.url as string)
.then(() => console.log('Connected to Database'))
.catch((error) => console.log('Database connection error', error));

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:3000',
];

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is running smoothly',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Handler 
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(config.server.port, () => {
  console.log(`🚀 Server running on port ${config.server.port}`);
});

