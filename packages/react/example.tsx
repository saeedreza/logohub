// Example usage of @logohub/react package
import React from 'react';
import { 
  Logo, 
  LogoGrid, 
  useLogos, 
  useLogo, 
  useLogoUrl,
  LogoHubClient 
} from '@logohub/react';

// Basic Logo Usage
export function BasicExample() {
  return (
    <div>
      <h2>Basic Logo Usage</h2>
      <Logo name="google" size={64} />
      <Logo name="microsoft" variant="monochrome" size={48} />
      <Logo name="apple" format="png" size={80} />
    </div>
  );
}

// Logo Grid Example
export function GridExample() {
  const techLogos = [
    'google', 'microsoft', 'apple', 'meta', 
    'aws', 'github', 'docker', 'react'
  ];

  return (
    <div>
      <h2>Logo Grid</h2>
      <LogoGrid 
        logos={techLogos}
        size={56}
        columns={4}
        gap={20}
      />

      <h3>All Available Logos</h3>
      <LogoGrid 
        fetchAll
        variant="monochrome"
        size={40}
        columns="auto"
      />
    </div>
  );
}

// Advanced Hook Usage
export function HooksExample() {
  const { data: logos, loading, error } = useLogos();
  const { data: googleLogo } = useLogo('google');
  
  const customLogoUrl = useLogoUrl({
    id: 'microsoft',
    variant: 'monochrome',
    format: 'png',
    size: 128,
    color: '#ff0000'
  });

  if (loading) return <div>Loading logos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Advanced Hook Usage</h2>
      
      <h3>All Logos ({logos?.total})</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {logos?.logos.map(logo => (
          <Logo key={logo.id} name={logo.id} size={32} />
        ))}
      </div>

      <h3>Google Logo Details</h3>
      {googleLogo && (
        <div>
          <Logo name="google" size={48} />
          <p><strong>Website:</strong> {googleLogo.metadata.website}</p>
          <p><strong>Industries:</strong> {googleLogo.metadata.industry.join(', ')}</p>
          <p><strong>Primary Color:</strong> {googleLogo.colors.primary}</p>
        </div>
      )}

      <h3>Custom URL Generation</h3>
      <img src={customLogoUrl} alt="Custom Microsoft logo" />
    </div>
  );
}

// Custom Client Configuration
export function CustomClientExample() {
  const customClient = new LogoHubClient({
    baseUrl: 'https://logohub.dev',
    defaultSize: 96,
    defaultVariant: 'standard'
  });

  return (
    <div>
      <h2>Custom Client Configuration</h2>
      <Logo name="react" client={customClient} />
      <Logo name="vue.js" client={customClient} variant="monochrome" />
    </div>
  );
}

// Error Handling Example
export function ErrorHandlingExample() {
  return (
    <div>
      <h2>Error Handling</h2>
      
      <h3>With Custom Fallback</h3>
      <Logo 
        name="non-existent-logo"
        fallback={
          <div style={{ 
            width: 64, 
            height: 64, 
            backgroundColor: '#f3f4f6',
            border: '2px dashed #d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Not Found
          </div>
        }
      />

      <h3>Default Fallback</h3>
      <Logo name="another-non-existent-logo" size={64} />
    </div>
  );
}

// Complete Demo App
export function DemoApp() {
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>@logohub/react Demo</h1>
      
      <BasicExample />
      <hr />
      
      <GridExample />
      <hr />
      
      <HooksExample />
      <hr />
      
      <CustomClientExample />
      <hr />
      
      <ErrorHandlingExample />
    </div>
  );
} 