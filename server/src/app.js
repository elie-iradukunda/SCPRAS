import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { handleDemoFallback } from './data/demoStore.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const uploadsPath = path.resolve(__dirname, '../uploads');

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SCPRAS API' });
});

app.use('/api', apiRoutes);
app.use('/api', (req, res) => {
  if (env.demoMode) {
    const handled = handleDemoFallback(req, res);
    if (handled !== false) return;
  }

  res.status(404).json({ message: 'API route not found.' });
});

app.use(express.static(clientDistPath));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDistPath, 'index.html'), (error) => {
      if (error) next(error);
    });
  }

  return next();
});

app.use(errorHandler);

export default app;
