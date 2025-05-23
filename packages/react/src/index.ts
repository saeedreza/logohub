// Export React components
export { Logo, type LogoProps } from './Logo';
export { LogoGrid, type LogoGridProps } from './LogoGrid';

// Export React hooks
export {
  useLogoHubClient,
  useLogos,
  useLogo,
  useLogoUrl,
  useLogoDataUrl,
  useLogoExists,
} from './hooks';

// Re-export core functionality for convenience
export type {
  LogoMetadata,
  LogoVariant,
  LogoConfig,
  LogoListResponse,
  LogoSummary,
  LogoDetailResponse,
  LogoSize,
  LogoHubConfig,
} from '@logohub/core';

export {
  LogoHubClient,
  LOGO_SIZES,
  LOGO_FORMATS,
  validateLogoId,
  formatLogoId,
  isValidLogoSize,
  getClosestLogoSize,
} from '@logohub/core'; 