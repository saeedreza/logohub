/**
 * LogoHub Analytics Utility
 *
 * Tracks API usage, logo views, downloads, searches, and errors.
 * Uses Vercel Analytics in production, console logging in development.
 * All data is sanitized to protect user privacy.
 */

const { track } = require('@vercel/analytics/server');

/**
 * Analytics class for tracking LogoHub API usage and events
 */
class LogoHubAnalytics {
  constructor() {
    // Only enable analytics in production to avoid dev noise
    this.enabled = process.env.NODE_ENV === 'production';

    // Define all trackable event types
    this.events = {
      API_CALL: 'api_call', // General API endpoint calls
      LOGO_VIEW: 'logo_view', // Logo metadata or file requests
      LOGO_DOWNLOAD: 'logo_download', // Actual file downloads
      SEARCH_QUERY: 'search_query', // Search operations
      ERROR: 'api_error', // API errors for monitoring
    };
  }

  /**
   * Core event tracking method
   * @param {string} event - Event type from this.events
   * @param {Object} properties - Event properties to track
   */
  async trackEvent(event, properties = {}) {
    if (!this.enabled) {
      // Log to console in development for debugging
      console.log(`[Analytics Debug] ${event}:`, properties);
      return;
    }

    try {
      await track(event, {
        timestamp: new Date().toISOString(),
        ...properties,
      });
    } catch (error) {
      // Don't let analytics failures break the API
      console.warn('Analytics tracking failed:', error.message);
    }
  }

  /**
   * Track API endpoint calls with sanitized request data
   * @param {Object} req - Express request object
   * @param {string} endpoint - API endpoint path
   * @param {Object} metadata - Additional tracking data
   */
  async trackApiCall(req, endpoint, metadata = {}) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers.referer || req.headers.referrer || 'direct';

    await this.trackEvent(this.events.API_CALL, {
      endpoint,
      method: req.method,
      userAgent: this.sanitizeUserAgent(userAgent),
      referer: this.sanitizeDomain(referer),
      query: this.sanitizeQuery(req.query),
      ...metadata,
    });
  }

  /**
   * Track logo views and interactions (metadata requests, file previews)
   * @param {Object} req - Express request object
   * @param {string} logoId - Logo identifier
   * @param {Object} metadata - View-specific data (format, size, etc.)
   */
  async trackLogoView(req, logoId, metadata = {}) {
    await this.trackEvent(this.events.LOGO_VIEW, {
      logoId,
      format: metadata.format || 'svg',
      size: metadata.size,
      color: metadata.color,
      variant: metadata.variant || 'standard',
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown'),
      referer: this.sanitizeDomain(req.headers.referer || 'direct'),
    });
  }

  /**
   * Track actual file downloads with performance metrics
   * @param {Object} req - Express request object
   * @param {string} logoId - Logo identifier
   * @param {Object} metadata - Download-specific data (fileSize, conversionTime, etc.)
   */
  async trackLogoDownload(req, logoId, metadata = {}) {
    await this.trackEvent(this.events.LOGO_DOWNLOAD, {
      logoId,
      format: metadata.format,
      size: metadata.size,
      color: metadata.color,
      fileSize: metadata.fileSize,
      conversionTime: metadata.conversionTime,
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown'),
    });
  }

  /**
   * Track search queries and results
   * @param {Object} req - Express request object
   * @param {string} query - Search query string
   * @param {Object} metadata - Search results and filters
   */
  async trackSearch(req, query, metadata = {}) {
    await this.trackEvent(this.events.SEARCH_QUERY, {
      query: this.sanitizeSearchQuery(query),
      resultsCount: metadata.resultsCount || 0,
      filters: metadata.filters || {},
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown'),
    });
  }

  /**
   * Track errors for monitoring and debugging
   * @param {Error} error - Error object
   * @param {Object} context - Error context (endpoint, statusCode, etc.)
   */
  async trackError(error, context = {}) {
    await this.trackEvent(this.events.ERROR, {
      errorType: error.name || 'Unknown',
      errorMessage: error.message?.substring(0, 100) || 'No message', // Truncate long messages
      statusCode: context.statusCode || 500,
      endpoint: context.endpoint || 'unknown',
      ...context,
    });
  }

  // === DATA SANITIZATION METHODS ===
  // These methods clean data to protect user privacy while preserving useful analytics

  /**
   * Extract browser/client type without exposing full user agent string
   * @param {string} userAgent - Raw user agent string
   * @returns {string} Sanitized browser/client type
   */
  sanitizeUserAgent(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('curl')) return 'curl';
    if (userAgent.includes('axios')) return 'axios';
    if (userAgent.includes('fetch')) return 'fetch';
    if (userAgent.includes('node')) return 'node';
    return 'other';
  }

  /**
   * Extract domain from referer without exposing full URL paths
   * @param {string} url - Referer URL
   * @returns {string} Domain or 'direct'/'unknown'
   */
  sanitizeDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain; // Only return hostname, not full URL
    } catch {
      return url === 'direct' ? 'direct' : 'unknown';
    }
  }

  /**
   * Remove sensitive query parameters, keep only safe ones
   * @param {Object} query - Express query object
   * @returns {Object} Sanitized query parameters
   */
  sanitizeQuery(query) {
    const sanitized = {};
    // Whitelist of safe query parameters to track
    const allowedParams = ['page', 'limit', 'format', 'size', 'color'];

    for (const [key, value] of Object.entries(query)) {
      if (allowedParams.includes(key)) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Clean search queries to remove potential PII
   * @param {string} query - Raw search query
   * @returns {string} Sanitized search query
   */
  sanitizeSearchQuery(query) {
    if (typeof query !== 'string') return 'non-string';
    // Limit length and remove special characters that might contain sensitive data
    return query
      .substring(0, 50)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '');
  }

  /**
   * Get current analytics configuration for admin/monitoring
   * @returns {Object} Analytics status and configuration
   */
  getUsageStats() {
    return {
      analyticsEnabled: this.enabled,
      environment: process.env.NODE_ENV || 'development',
      trackingEvents: Object.values(this.events),
    };
  }
}

// Create singleton instance for use across the application
const analytics = new LogoHubAnalytics();

module.exports = { analytics, LogoHubAnalytics };
