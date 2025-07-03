const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Database connection
const connectDB = require('./config/db');
connectDB();

// CORS configuration - Allow all Vercel domains and preview URLs
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow all Vercel domains (production and preview URLs)
    if (origin.match(/^https:\/\/.*\.vercel\.app$/)) {
      return callback(null, true);
    }
    
    // Allow the specific frontend URL from .env
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', require('./routes/files'));
app.use('/api/users', require('./routes/users'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Serve uploaded files (protected route)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
