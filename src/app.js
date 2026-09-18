const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const { ensureUploadDirs } = require('./utils/fileHelper');
const ApiResponse = require('./utils/apiResponse');

const app = express();

// Ensure upload folders exist
ensureUploadDirs();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// HTTP request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// General API Rate Limiting
app.use('/api', apiLimiter);

// Ignore favicon.ico requests from browsers
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health Check endpoint
app.get('/api/health', (req, res) => {
  return ApiResponse.success(res, 'Smart NCC Cadet Management System API is healthy', {
    status: 'ONLINE',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

// Mount All Routes
app.use('/api', apiRoutes);

// API Documentation / root welcome endpoint for API
app.get('/api', (req, res) => {
  return ApiResponse.success(
    res,
    'Welcome to the Smart NCC Cadet Management System API. Explore /api/health or view Postman documentation.'
  );
});

// Serve frontend build if dist exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback: send all non-API and non-upload GET/HEAD routes to React's index.html
  app.use((req, res, next) => {
    if (['GET', 'HEAD'].includes(req.method) && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
} else {
  // If client/dist is not built yet, provide helpful message on root
  app.get('/', (req, res) => {
    return ApiResponse.success(
      res,
      'Welcome to the Smart NCC Cadet Management System API. Frontend build not detected in client/dist. Run "npm run client:build" to bundle frontend.'
    );
  });
}

// Catch 404 Not Found
app.use(notFoundHandler);

// Central Error Handling
app.use(errorHandler);

module.exports = app;
