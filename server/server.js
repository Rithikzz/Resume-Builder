import express from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import connectDB from "./configs/db.js";
import { globalLimiter, authLimiter } from "./middlewares/rateLimiter.js";

// Routes
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import coverLetterRouter from "./routes/coverLetterRoutes.js";
import portfolioRouter from "./routes/portfolioRoutes.js";
import documentTypeRouter from "./routes/documentTypeRoutes.js";

// Plugin Registry — register all document types
import { registerPlugin } from "./plugins/documentRegistry.js";
import resumePlugin from "./plugins/resumePlugin.js";
import coverLetterPlugin from "./plugins/coverLetterPlugin.js";
import portfolioPlugin from "./plugins/portfolioPlugin.js";

registerPlugin(resumePlugin);
registerPlugin(coverLetterPlugin);
registerPlugin(portfolioPlugin);

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false // Allow CDN fonts for preview
}));

app.use(cors({
    origin: [
        CLIENT_URL,
        'http://localhost',          // Docker — nginx frontend on port 80
        'http://localhost:80',
        'http://localhost:5173',     // Vite dev server
        'http://localhost:5174',
        'http://localhost:4173',     // Vite preview
    ],
    credentials: true
}));

// ─── Request Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── Database ─────────────────────────────────────────────────────────────────
await connectDB();

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
    status: 'ok',
    message: 'Universal Document Builder API is live',
    version: '2.0.0',
    features: ['resume', 'cover-letter', 'portfolio', 'github-analyzer']
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/document-types', documentTypeRouter);
app.use('/api/users', authLimiter, userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);
app.use('/api/cover-letters', coverLetterRouter);
app.use('/api/portfolios', portfolioRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, async () => {
    console.log(`\n🚀 Universal Document Builder API`);
    console.log(`   Server  : http://localhost:${PORT}`);
    console.log(`   Client  : ${CLIENT_URL}`);
    console.log(`   Plugins : resume, cover-letter, portfolio`);

    // Validate GitHub token at startup — problems surface immediately, not on first user request
    try {
        const { validateToken } = await import('./services/githubService.js');
        const result = await validateToken();
        if (result.valid) {
            console.log(`   GitHub  : ✅ Token valid — ${result.remaining}/${result.limit} req/hr remaining`);
        } else {
            console.warn(`   GitHub  : ⚠️  ${result.reason} — unauthenticated limit (60 req/hr) applies`);
        }
    } catch (e) {
        console.warn(`   GitHub  : ⚠️  Token check failed: ${e.message}`);
    }
    console.log();
});