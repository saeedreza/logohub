import React, { forwardRef, useState, useEffect } from 'react';
import type { LogoConfig, LogoSize } from '@logohub/core';
import { LogoHubClient } from '@logohub/core';

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** Logo ID (e.g., 'google', 'microsoft') */
  name: string;
  /** Logo variant */
  variant?: 'standard' | 'monochrome';
  /** Logo format */
  format?: 'svg' | 'png' | 'webp';
  /** Logo size (for raster formats) */
  size?: LogoSize;
  /** Custom color (hex format) */
  color?: string;
  /** Fallback content when logo fails to load */
  fallback?: React.ReactNode;
  /** Custom LogoHub client instance */
  client?: LogoHubClient;
  /** Enable lazy loading */
  lazy?: boolean;
  /** Alt text (defaults to logo name) */
  alt?: string;
}

const defaultClient = new LogoHubClient();

export const Logo = forwardRef<HTMLImageElement, LogoProps>(({
  name,
  variant = 'standard',
  format = 'svg',
  size = 64,
  color,
  fallback,
  client = defaultClient,
  lazy = true,
  alt,
  onError,
  onLoad,
  className = '',
  style = {},
  ...props
}, ref) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state when props change
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [name, variant, format, size, color]);

  const logoConfig: LogoConfig = {
    id: name,
    variant,
    format,
    size,
    color,
  };

  const logoUrl = client.getLogoUrl(logoConfig);
  const logoAlt = alt || `${name} logo`;

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(event);
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  // Show fallback if there's an error
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Default fallback for errors
  if (hasError) {
    return (
      <div
        className={`logohub-fallback ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#6b7280',
          ...style,
        }}
      >
        {name}
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={logoUrl}
      alt={logoAlt}
      className={`logohub-logo ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
      loading={lazy ? 'lazy' : 'eager'}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
});

Logo.displayName = 'Logo'; 