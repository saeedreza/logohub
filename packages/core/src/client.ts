import type { 
  LogoHubConfig, 
  LogoApiResponse, 
  LogoDetailResponse,
  LogoConfig,
  LogoSize 
} from './types';

export class LogoHubClient {
  private config: Required<LogoHubConfig>;

  constructor(config: LogoHubConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://logohub.dev',
      apiVersion: config.apiVersion || 'v1',
      defaultSize: config.defaultSize || 64,
      defaultVariant: config.defaultVariant || 'standard',
      defaultFormat: config.defaultFormat || 'svg',
    };
  }

  /**
   * Get list of all available logos
   */
  async getLogos(page = 1, limit = 50): Promise<LogoApiResponse> {
    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/logos?page=${page}&limit=${limit}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch logos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information about a specific logo
   */
  async getLogo(id: string): Promise<LogoDetailResponse> {
    const url = `${this.config.baseUrl}/api/${this.config.apiVersion}/logos/${id}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch logo "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate URL for a logo file
   */
  getLogoUrl(config: LogoConfig): string {
    const {
      id,
      variant = this.config.defaultVariant,
      format = this.config.defaultFormat,
      size = this.config.defaultSize,
      color
    } = config;

    const filename = `${id}-${variant}.${format}`;
    let url = `${this.config.baseUrl}/api/${this.config.apiVersion}/logos/${id}?file=${filename}`;

    // Add size parameter for raster formats
    if (format !== 'svg' && size) {
      url += `&size=${size}`;
    }

    // Add color parameter if specified
    if (color) {
      url += `&color=${encodeURIComponent(color)}`;
    }

    return url;
  }

  /**
   * Download logo as blob
   */
  async downloadLogo(config: LogoConfig): Promise<Blob> {
    const url = this.getLogoUrl(config);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      throw new Error(`Failed to download logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get logo as data URL for inline embedding
   */
  async getLogoDataUrl(config: LogoConfig): Promise<string> {
    const blob = await this.downloadLogo(config);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if logo exists
   */
  async logoExists(id: string): Promise<boolean> {
    try {
      await this.getLogo(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available logo sizes
   */
  getAvailableSizes(): LogoSize[] {
    return [16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256];
  }

  /**
   * Validate hex color format
   */
  static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<LogoHubConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
} 