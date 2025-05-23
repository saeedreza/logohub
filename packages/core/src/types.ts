// Core types for LogoHub

// Import CSS properties type to avoid React namespace dependency
import type { CSSProperties } from 'react';

export interface LogoMetadata {
  name: string;
  website: string;
  industry: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  guidelines: string;
  lastUpdated: string;
  contributor: string;
  versions: LogoVersion[];
  usage: {
    restrictions: string;
    attribution: string;
  };
}

export interface LogoVersion {
  version: string;
  date: string;
  description: string;
}

export interface LogoVariant {
  name: 'standard' | 'monochrome';
  format: 'svg' | 'png' | 'webp';
  size?: number;
  color?: string;
}

export interface LogoConfig {
  id: string;
  variant?: LogoVariant['name'];
  format?: LogoVariant['format'];
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export interface LogoApiResponse {
  logos: LogoSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface LogoSummary {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  variants: {
    standard: string;
    monochrome: string;
  };
}

export interface LogoDetailResponse extends LogoSummary {
  metadata: LogoMetadata;
  urls: {
    svg: {
      standard: string;
      monochrome: string;
    };
    png: {
      standard: string;
      monochrome: string;
    };
    webp: {
      standard: string;
      monochrome: string;
    };
  };
}

export type LogoSize = 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 80 | 96 | 128 | 256;

export interface LogoHubConfig {
  baseUrl?: string;
  apiVersion?: string;
  defaultSize?: LogoSize;
  defaultVariant?: LogoVariant['name'];
  defaultFormat?: LogoVariant['format'];
} 