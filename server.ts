import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import psiHandler from './api/psi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');

  // Serverless-compatible API routes stored in /api
  app.all('/api/health', async (req, res) => {
    await healthHandler(
      {
        method: req.method,
        query: req.query as Record<string, string | string[] | undefined>,
        headers: req.headers,
      },
      res
    );
  });

  app.all('/api/psi', async (req, res) => {
    await psiHandler(
      {
        method: req.method,
        query: req.query as Record<string, string | string[] | undefined>,
        headers: req.headers,
      },
      res
    );
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SG HazeMonitor server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
