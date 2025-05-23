// Export all types
export type {
  LogoMetadata,
  LogoVersion,
  LogoVariant,
  LogoConfig,
  LogoApiResponse,
  LogoSummary,
  LogoDetailResponse,
  LogoSize,
  LogoHubConfig,
} from './types';

// Export the client
export { LogoHubClient } from './client';

// Export utilities
export const LOGO_SIZES: readonly number[] = [16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 256];

export const LOGO_VARIANTS = {
  STANDARD: 'standard' as const,
  MONOCHROME: 'monochrome' as const,
} as const;

export const LOGO_FORMATS = {
  SVG: 'svg' as const,
  PNG: 'png' as const,
  WEBP: 'webp' as const,
} as const;

// Utility functions
export const validateLogoId = (id: string): boolean => {
  return /^[a-z0-9-]+$/.test(id) && id.length > 0;
};

export const formatLogoId = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const isValidLogoSize = (size: number): boolean => {
  return LOGO_SIZES.includes(size);
};

export const getClosestLogoSize = (targetSize: number): number => {
  return LOGO_SIZES.reduce((prev, curr) => 
    Math.abs(curr - targetSize) < Math.abs(prev - targetSize) ? curr : prev
  );
}; 