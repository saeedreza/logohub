import { useState, useEffect, useMemo } from 'react';
import type { 
  LogoHubClient, 
  LogoListResponse, 
  LogoDetailResponse,
  LogoConfig,
  LogoHubConfig 
} from '@logohub/core';
import { LogoHubClient as Client } from '@logohub/core';

// Hook for managing LogoHub client
export function useLogoHubClient(config?: LogoHubConfig): LogoHubClient {
  return useMemo(() => new Client(config), [config]);
}

// Hook for fetching all logos
export function useLogos(
  client?: LogoHubClient, 
  params: {
    page?: number;
    limit?: number;
    format?: string;
    search?: string;
  } = {}
) {
  const defaultClient = useLogoHubClient();
  const logoClient = client || defaultClient;
  
  const [data, setData] = useState<LogoListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLogos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await logoClient.getLogos(params);
        
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch logos'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLogos();

    return () => {
      cancelled = true;
    };
  }, [logoClient, params.page, params.limit, params.format, params.search]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    logoClient.getLogos(params)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err : new Error('Failed to fetch logos')))
      .finally(() => setLoading(false));
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook for fetching a specific logo
export function useLogo(logoId: string, client?: LogoHubClient) {
  const defaultClient = useLogoHubClient();
  const logoClient = client || defaultClient;
  
  const [data, setData] = useState<LogoDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!logoId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await logoClient.getLogo(logoId);
        
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(`Failed to fetch logo "${logoId}"`));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLogo();

    return () => {
      cancelled = true;
    };
  }, [logoClient, logoId]);

  const refetch = () => {
    if (!logoId) return;
    
    setLoading(true);
    setError(null);
    logoClient.getLogo(logoId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err : new Error(`Failed to fetch logo "${logoId}"`)))
      .finally(() => setLoading(false));
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook for generating logo URLs
export function useLogoUrl(config: LogoConfig, client?: LogoHubClient): string {
  const defaultClient = useLogoHubClient();
  const logoClient = client || defaultClient;
  
  return useMemo(() => {
    return logoClient.getLogoUrl(config);
  }, [logoClient, config]);
}

// Hook for downloading logos as data URLs
export function useLogoDataUrl(config: LogoConfig, client?: LogoHubClient) {
  const defaultClient = useLogoHubClient();
  const logoClient = client || defaultClient;
  
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await logoClient.getLogoDataUrl(config);
      setDataUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download logo'));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDataUrl(null);
    setError(null);
  };

  return {
    dataUrl,
    loading,
    error,
    download,
    reset,
  };
}

// Hook for checking if a logo exists
export function useLogoExists(logoId: string, client?: LogoHubClient) {
  const defaultClient = useLogoHubClient();
  const logoClient = client || defaultClient;
  
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!logoId) {
      setExists(null);
      setLoading(false);
      setError(null);
      return;
    }

    const checkExists = async () => {
      try {
        setLoading(true);
        setError(null);
        const logoExists = await logoClient.logoExists(logoId);
        
        if (!cancelled) {
          setExists(logoExists);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(`Failed to check if logo "${logoId}" exists`));
          setExists(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkExists();

    return () => {
      cancelled = true;
    };
  }, [logoClient, logoId]);

  return {
    exists,
    loading,
    error,
  };
} 