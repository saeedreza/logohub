/**
 * Health Check API Endpoint - Vercel Serverless Function
 *
 * Simple health monitoring endpoint that returns the API status and basic information.
 * Used by monitoring services, load balancers, and deployment systems to verify
 * that the API is running and responding to requests.
 */

/**
 * Vercel serverless function handler
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 */
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Return health status
  res.status(200).json({
    status: 'ok', // Health status indicator
    timestamp: new Date().toISOString(), // Current server time for sync verification
    version: '0.1.0', // API version for deployment tracking
  });
};
