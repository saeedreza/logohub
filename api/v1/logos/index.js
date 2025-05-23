const fs = require('fs').promises;
const path = require('path');

// Simple rate limiting
const rateLimits = new Map();

const rateLimit = (req, res) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const identifier = apiKey || clientIP;
  
  if (!rateLimits.has(identifier)) {
    rateLimits.set(identifier, {
      limit: 100,
      remaining: 100,
      reset: Date.now() + 3600000,
    });
  }
  
  const limit = rateLimits.get(identifier);
  
  if (Date.now() > limit.reset) {
    limit.remaining = limit.limit;
    limit.reset = Date.now() + 3600000;
  }
  
  res.setHeader('X-RateLimit-Limit', limit.limit);
  res.setHeader('X-RateLimit-Remaining', limit.remaining);
  res.setHeader('X-RateLimit-Reset', Math.floor(limit.reset / 1000));
  
  if (limit.remaining <= 0) {
    console.warn(`Rate limit exceeded for ${identifier}`);
  }
  
  limit.remaining--;
  
  return true;
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  rateLimit(req, res);
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const industry = req.query.industry;
    const format = req.query.format;
    
    // Sample data for testing - will be replaced with actual file system access later
    const sampleLogos = [
      {
        id: 'vercel',
        name: 'Vercel',
        versions: ['standard', 'monochrome'],
        formats: ['svg', 'png'],
        url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/vercel`
      },
      {
        id: 'nextjs',
        name: 'Next.js',
        versions: ['standard', 'monochrome'],
        formats: ['svg', 'png'],
        url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/v1/logos/nextjs`
      }
    ];
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogos = sampleLogos.slice(startIndex, endIndex);
    
    res.json({
      total: sampleLogos.length,
      page,
      limit,
      logos: paginatedLogos,
      message: 'Sample data - API is working! Deployment protection needs to be disabled in Vercel dashboard.'
    });
  } catch (err) {
    console.error('Error fetching logos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 