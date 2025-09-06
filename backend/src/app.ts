import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Chatbook backend!");
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Chatbook Study Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// API test route
app.get('/api/test', (_req: Request, res: Response) => {
  res.json({
    message: 'Backend is working!',
    supabase: process.env.SUPABASE_URL ? 'Connected' : 'Not configured',
    gemini: process.env.GEMINI_API_KEY ? 'Connected' : 'Not configured'
  });
});

// Example POST route
app.post("/api/echo", (req: Request, res: Response) => {
  res.json({
    message: "Received data successfully",
    data: req.body,
  });
});

// Error handler middleware (typed)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Chatbook Study Hub API ready!`);
});

export default app;