// Core types for LogoHub

// Import CSS properties type to avoid React namespace dependency
import type { CSSProperties } from 'react';

export interface LogoMetadata {
  name: string;
  title: string;
  website: string;
  colors: string[];
  hasSymbol: boolean;
  license: string;
  created: string;
  updated: string;
}

export interface LogoVariant {
  name: string;
  formats: {
    svg: {
      url: string;
    };
    png: {
      sizes: Array<{
        size: number;
        maxDimension: number;
        url: string;
      }>;
      dynamic: string;
    };
    webp: {
      sizes: Array<{
        size: number;
        maxDimension: number;
        url: string;
      }>;
      dynamic: string;
    };
  };
}

export interface LogoConfig {
  id: string;
  format?: 'svg' | 'png' | 'webp';
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

// API Response Types
export interface LogoListResponse {
  total: number;
  page: number;
  limit: number;
  logos: LogoSummary[];
  capabilities: {
    formats: string[];
    dynamicConversion: boolean;
    colorCustomization: boolean;
    searchEnabled: boolean;
    standardSizes: number[];
  };
  message?: string;
}

export interface LogoSummary {
  id: string;
  name: string;
  title: string;
  tags: string[];
  versions: string[];
  formats: string[];
  capabilities: {
    colorCustomization: boolean;
    dynamicSizing: boolean;
  };
  url: string;
}

export interface LogoDetailResponse {
  id: string;
  name: string;
  website: string;
  colors: string[];
  versions: LogoVariant[];
  capabilities: {
    colorCustomization: boolean;
    formats: string[];
    standardSizes: number[];
    dynamicSizing: boolean;
  };
}

export type LogoSize = 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 80 | 96 | 128 | 256 | 512;

export interface LogoHubConfig {
  baseUrl?: string;
  apiVersion?: string;
  defaultSize?: LogoSize;
  defaultFormat?: 'svg' | 'png' | 'webp';
} 