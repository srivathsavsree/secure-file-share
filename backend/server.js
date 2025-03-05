const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials:true
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require('fs-extra');
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// Routes (we'll add these soon)
app.use('/api/users', require('./routes/users'));
app.use('/api/files', require('./routes/files'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Secure File Share API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});