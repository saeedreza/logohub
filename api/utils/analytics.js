const { track } = require('@vercel/analytics/server');

class LogoHubAnalytics {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.events = {
      API_CALL: 'api_call',
      LOGO_VIEW: 'logo_view',
      LOGO_DOWNLOAD: 'logo_download',
      SEARCH_QUERY: 'search_query',
      ERROR: 'api_error',
      RATE_LIMIT: 'rate_limit_hit'
    };
  }

  async trackEvent(event, properties = {}) {
    if (!this.enabled) {
      console.log(`[Analytics Debug] ${event}:`, properties);
      return;
    }

    try {
      await track(event, {
        timestamp: new Date().toISOString(),
        ...properties
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error.message);
    }
  }

  // Track API endpoint calls
  async trackApiCall(req, endpoint, metadata = {}) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers.referer || req.headers.referrer || 'direct';
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    await this.trackEvent(this.events.API_CALL, {
      endpoint,
      method: req.method,
      userAgent: this.sanitizeUserAgent(userAgent),
      referer: this.sanitizeDomain(referer),
      hasApiKey: !!req.headers.authorization,
      query: this.sanitizeQuery(req.query),
      ...metadata
    });
  }

  // Track logo views and interactions
  async trackLogoView(req, logoId, metadata = {}) {
    await this.trackEvent(this.events.LOGO_VIEW, {
      logoId,
      format: metadata.format || 'svg',
      size: metadata.size,
      color: metadata.color,
      variant: metadata.variant || 'standard',
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown'),
      referer: this.sanitizeDomain(req.headers.referer || 'direct')
    });
  }

  // Track downloads (when files are actually served)
  async trackLogoDownload(req, logoId, metadata = {}) {
    await this.trackEvent(this.events.LOGO_DOWNLOAD, {
      logoId,
      format: metadata.format,
      size: metadata.size,
      color: metadata.color,
      fileSize: metadata.fileSize,
      conversionTime: metadata.conversionTime,
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown')
    });
  }

  // Track search queries
  async trackSearch(req, query, metadata = {}) {
    await this.trackEvent(this.events.SEARCH_QUERY, {
      query: this.sanitizeSearchQuery(query),
      resultsCount: metadata.resultsCount || 0,
      filters: metadata.filters || {},
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown')
    });
  }

  // Track errors for monitoring
  async trackError(error, context = {}) {
    await this.trackEvent(this.events.ERROR, {
      errorType: error.name || 'Unknown',
      errorMessage: error.message?.substring(0, 100) || 'No message',
      statusCode: context.statusCode || 500,
      endpoint: context.endpoint || 'unknown',
      ...context
    });
  }

  // Track rate limiting hits
  async trackRateLimit(req, identifier) {
    await this.trackEvent(this.events.RATE_LIMIT, {
      identifier: this.hashIdentifier(identifier),
      userAgent: this.sanitizeUserAgent(req.headers['user-agent'] || 'unknown'),
      endpoint: req.url || 'unknown'
    });
  }

  // Utility methods for data sanitization
  sanitizeUserAgent(userAgent) {
    // Extract browser/client type without personal info
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

  sanitizeDomain(url) {
    try {
      const domain = new URL(url).hostname;
      // Return only the domain, not full URL
      return domain;
    } catch {
      return url === 'direct' ? 'direct' : 'unknown';
    }
  }

  sanitizeQuery(query) {
    // Remove potentially sensitive data, keep only structure
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
      if (['page', 'limit', 'format', 'size', 'color', 'industry', 'category'].includes(key)) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  sanitizeSearchQuery(query) {
    // Keep search terms but limit length and remove potential PII
    if (typeof query !== 'string') return 'non-string';
    return query.substring(0, 50).toLowerCase().replace(/[^\w\s-]/g, '');
  }

  hashIdentifier(identifier) {
    // Create a hash for rate limiting tracking without storing IPs
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
  }

  // Generate usage statistics (for admin/monitoring)
  getUsageStats() {
    return {
      analyticsEnabled: this.enabled,
      environment: process.env.NODE_ENV || 'development',
      trackingEvents: Object.values(this.events)
    };
  }
}

// Create singleton instance
const analytics = new LogoHubAnalytics();

module.exports = { analytics, LogoHubAnalytics }; 