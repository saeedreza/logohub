import React from 'react';
import type { LogoSize, LogoHubClient } from '@logohub/core';
import { Logo, type LogoProps } from './Logo';
import { useLogos } from './hooks';

export interface LogoGridProps {
  /** Array of logo names to display */
  logos?: string[];
  /** Logo variant for all logos */
  variant?: 'standard' | 'monochrome';
  /** Logo format for all logos */
  format?: 'svg' | 'png' | 'webp';
  /** Logo size for all logos */
  size?: LogoSize;
  /** Custom color for all logos */
  color?: string;
  /** Grid columns (CSS grid-template-columns) */
  columns?: number | string;
  /** Gap between logos */
  gap?: number | string;
  /** Custom LogoHub client */
  client?: LogoHubClient;
  /** Additional props passed to each Logo component */
  logoProps?: Partial<LogoProps>;
  /** Custom className for the grid container */
  className?: string;
  /** Custom style for the grid container */
  style?: React.CSSProperties;
  /** Loading component */
  loadingComponent?: React.ReactNode;
  /** Error component */
  errorComponent?: React.ReactNode;
  /** Fetch all available logos if no logos array provided */
  fetchAll?: boolean;
  /** Page number when fetching all logos */
  page?: number;
  /** Limit when fetching all logos */
  limit?: number;
  /** Render function for custom logo item layout */
  renderLogo?: (logoName: string, index: number) => React.ReactNode;
}

export const LogoGrid: React.FC<LogoGridProps> = ({
  logos,
  variant = 'standard',
  format = 'svg',
  size = 64,
  color,
  columns = 'auto',
  gap = 16,
  client,
  logoProps = {},
  className = '',
  style = {},
  loadingComponent,
  errorComponent,
  fetchAll = false,
  page = 1,
  limit = 50,
  renderLogo,
}) => {
  // Fetch all logos if no specific logos provided and fetchAll is true
  const { data: logoData, loading, error } = useLogos(
    fetchAll && !logos ? client : undefined,
    page,
    limit
  );

  // Determine which logos to display
  const displayLogos = logos || (logoData?.logos.map(logo => logo.id) ?? []);

  // Show loading state
  if (fetchAll && !logos && loading) {
    return (
      <div className={`logohub-grid-loading ${className}`} style={style}>
        {loadingComponent || <div>Loading logos...</div>}
      </div>
    );
  }

  // Show error state
  if (fetchAll && !logos && error) {
    return (
      <div className={`logohub-grid-error ${className}`} style={style}>
        {errorComponent || <div>Error loading logos: {error.message}</div>}
      </div>
    );
  }

  // No logos to display
  if (displayLogos.length === 0) {
    return (
      <div className={`logohub-grid-empty ${className}`} style={style}>
        No logos to display
      </div>
    );
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' 
      ? `repeat(${columns}, 1fr)` 
      : typeof columns === 'string' 
        ? columns === 'auto' 
          ? `repeat(auto-fill, minmax(${size + 32}px, 1fr))`
          : columns
        : `repeat(auto-fill, minmax(${size + 32}px, 1fr))`,
    gap,
    ...style,
  };

  return (
    <div 
      className={`logohub-grid ${className}`} 
      style={gridStyle}
    >
      {displayLogos.map((logoName, index) => (
        <div 
          key={logoName} 
          className="logohub-grid-item"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {renderLogo ? (
            renderLogo(logoName, index)
          ) : (
            <>
              <Logo
                name={logoName}
                variant={variant}
                format={format}
                size={size}
                color={color}
                client={client}
                {...logoProps}
              />
              <span 
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'center',
                  textTransform: 'capitalize',
                }}
              >
                {logoName.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}; 