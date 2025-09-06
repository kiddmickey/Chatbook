import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chatbook Study Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    supabase: process.env.SUPABASE_URL ? 'Connected' : 'Not configured',
    gemini: process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Chatbook Study Hub API ready!`);
});

export default app;