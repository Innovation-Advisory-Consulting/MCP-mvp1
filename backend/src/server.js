import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, validateConfig } from './config/env.js';
import customerRoutes from './routes/customerRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api', customerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Customer Management Backend - Dataverse Integration     ║
╠════════════════════════════════════════════════════════════╣
║   Environment: ${config.nodeEnv.padEnd(43)}║
║   Port:        ${String(config.port).padEnd(43)}║
║   Dataverse:   ${config.dataverse.url.substring(0, 43).padEnd(43)}║
╚════════════════════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
