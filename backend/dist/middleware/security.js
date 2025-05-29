"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestSignature = exports.validateApiKey = exports.sanitizeInput = exports.securityHeaders = exports.csrfProtection = exports.generateCSRFToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Generate CSRF token
const generateCSRFToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateCSRFToken = generateCSRFToken;
// CSRF protection middleware
const csrfProtection = (req, res, next) => {
    // Skip CSRF for certain routes
    const skipRoutes = ['/health', '/api/v1/webhooks'];
    if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
    }
    // Skip for GET requests
    if (req.method === 'GET') {
        return next();
    }
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    if (!token || !sessionToken || token !== sessionToken) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Your request could not be validated. Please refresh and try again.',
        });
    }
    next();
};
exports.csrfProtection = csrfProtection;
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Additional security headers not covered by helmet
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    next();
};
exports.securityHeaders = securityHeaders;
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Helper function to sanitize strings
const sanitizeString = (str) => {
    // Remove null bytes
    str = str.replace(/\0/g, '');
    // Trim whitespace
    str = str.trim();
    // Prevent NoSQL injection by removing $ and .
    str = str.replace(/[$\.]/g, '');
    return str;
};
// Helper function to recursively sanitize objects
const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    const sanitized = {};
    Object.keys(obj).forEach(key => {
        // Skip keys that start with $ or contain .
        if (!key.startsWith('$') && !key.includes('.')) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    });
    return sanitized;
};
// API key validation middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({
            error: 'Missing API key',
            message: 'Please provide an API key in the x-api-key header',
        });
    }
    // TODO: Implement actual API key validation against database
    // For now, just check if it's a valid format
    if (!/^[a-zA-Z0-9]{32,}$/.test(apiKey)) {
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is invalid',
        });
    }
    next();
};
exports.validateApiKey = validateApiKey;
// Request signing validation
const validateRequestSignature = (secret) => {
    return (req, res, next) => {
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        if (!signature || !timestamp) {
            return res.status(401).json({
                error: 'Missing signature',
                message: 'Request signature is required',
            });
        }
        // Check timestamp to prevent replay attacks (5 minute window)
        const requestTime = parseInt(timestamp);
        const currentTime = Date.now();
        if (Math.abs(currentTime - requestTime) > 5 * 60 * 1000) {
            return res.status(401).json({
                error: 'Request expired',
                message: 'Request timestamp is too old',
            });
        }
        // Verify signature
        const payload = `${timestamp}.${JSON.stringify(req.body)}`;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        if (signature !== expectedSignature) {
            return res.status(401).json({
                error: 'Invalid signature',
                message: 'Request signature verification failed',
            });
        }
        next();
    };
};
exports.validateRequestSignature = validateRequestSignature;
//# sourceMappingURL=security.js.map