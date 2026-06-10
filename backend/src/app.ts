import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import docRoutes from './routes/docRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Standard middleware
app.use(helmet());
app.use(
  cors({
    origin: '*', // For development purposes. We can restrict this to the frontend URL later if needed.
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' })); // Increased limit to support base64 docx buffers
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes mapping
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/docs', apiLimiter, docRoutes);

// Base test route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Google Docs Clone API is healthy' });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

export default app;
