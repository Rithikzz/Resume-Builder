import rateLimit from 'express-rate-limit';

/**
 * express-rate-limit v8 + Express 5 compatibility:
 * Using `message` as an object causes a "no body" 429 in Express 5.
 * Fix: use a `handler` function to write the JSON response explicitly.
 */
const makeHandler = (msg) => (req, res) => {
    res.status(429).json({ message: msg });
};

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many requests, please try again later.')
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('Too many auth attempts. Please try again in 15 minutes.')
});

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('AI request limit reached. Please wait a moment.')
});

export const githubLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: makeHandler('GitHub analysis limit reached. Please wait a moment.')
});
