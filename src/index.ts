import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Prisma } from '@prisma/client';
import portfolioRoutes from './routes/portfolio';
import adminRoutes from './routes/admin';
import blogRoutes from './routes/blog';
import prisma, { testConnection, initializeDatabase } from './config/database';
import { authenticateToken, requireRole } from './middleware/auth';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Behind a reverse proxy (nginx) in production — needed for correct client IPs
// (rate limiting) and secure-cookie/protocol handling.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Uploads directory. Configurable via UPLOAD_DIR so it can point at a persistent
// volume/path that survives re-deploys (uploaded images must never be wiped on deploy).
// Defaults to <backend>/uploads for local development.
const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
// Allow images served from /uploads to be embedded by the frontend (different origin).
// helmet's default Cross-Origin-Resource-Policy: same-origin would otherwise block them.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// General API rate limit — blunt protection against abuse/scraping.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blog', blogRoutes);

// File upload route (admin only — prevents anonymous/abusive uploads).
// Accepts the form field "file". Stored images live in uploadsDir and are served
// statically from /uploads. The response mirrors the old cloud shape (file._id)
// so existing clients keep working; _id is the bare filename used to build URLs.
app.post('/api/upload', authenticateToken, requireRole(['admin']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;
    const path = `/uploads/${filename}`;

    res.json({
      message: 'File uploaded successfully',
      filename,
      path,
      url: path,
      file: {
        _id: filename,
        filename,
        url: path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Liveness check — is the process up? (cheap, no dependencies)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness check — can we actually serve traffic? Verifies the DB is reachable.
// Use this for load-balancer / orchestrator readiness probes.
app.get('/health/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({ status: 'unavailable', error: 'Database not reachable' });
  }
});

// Dynamic sitemap — always reflects current projects and published blog posts.
app.get('/sitemap.xml', async (req, res) => {
  try {
    const base = process.env.SITE_URL || 'https://sanket-jagtap.in';
    const staticPaths = [
      { loc: '/', priority: '1.0', changefreq: 'weekly' },
      { loc: '/skills', priority: '0.7', changefreq: 'monthly' },
      { loc: '/experience', priority: '0.7', changefreq: 'monthly' },
      { loc: '/projects', priority: '0.8', changefreq: 'weekly' },
      { loc: '/services', priority: '0.6', changefreq: 'monthly' },
      { loc: '/blog', priority: '0.7', changefreq: 'weekly' },
      { loc: '/contact', priority: '0.5', changefreq: 'yearly' }
    ];

    const [projects, blogs] = await Promise.all([
      prisma.project.findMany({ select: { id: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } })
    ]);

    const urls: string[] = [];
    for (const p of staticPaths) {
      urls.push(`  <url><loc>${base}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`);
    }
    for (const pr of projects) {
      urls.push(`  <url><loc>${base}/projects/${pr.id}</loc><lastmod>${pr.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    }
    for (const b of blogs) {
      urls.push(`  <url><loc>${base}/blog/${b.slug}</loc><lastmod>${b.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }

  // Rejected by multer's fileFilter (e.g. non-image upload).
  if (err && err.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: err.message });
  }

  // Safety net for any Prisma error that wasn't handled at the route level.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'A record with this value already exists' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  }

  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await testConnection();
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Portfolio backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Admin API: http://localhost:${PORT}/api/admin`);
      console.log(`📝 Blog API: http://localhost:${PORT}/api/blog`);
      console.log(`💼 Portfolio API: http://localhost:${PORT}/api/portfolio`);
    });

    // Graceful shutdown: stop accepting connections, then close the DB pool.
    // Without this, redeploys can drop in-flight requests and leak DB connections.
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Server closed and database disconnected.');
        process.exit(0);
      });
      // Force-exit if connections don't drain in time.
      setTimeout(() => {
        console.error('⏱️  Forced shutdown after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
