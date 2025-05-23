/**
 * Health Check API Endpoint
 * 
 * Simple health monitoring endpoint that returns the API status and basic information.
 * Used by monitoring services, load balancers, and deployment systems to verify
 * that the API is running and responding to requests.
 * 
 * Returns:
 * - status: Always "ok" if the API is responding
 * - timestamp: Current server time in ISO format
 * - version: Current API version for deployment tracking
 */

/**
 * Handle GET /api/health endpoint
 * 
 * This endpoint should always respond quickly with a 200 status code if the API
 * is healthy and able to process requests. It requires no authentication and
 * performs no complex operations to ensure reliability.
 * 
 * @param {Object} req - Express request object (unused)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with health status information
 */
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok',                           // Health status indicator
    timestamp: new Date().toISOString(),    // Current server time for sync verification
    version: '0.1.0'                        // API version for deployment tracking
  });
}; 