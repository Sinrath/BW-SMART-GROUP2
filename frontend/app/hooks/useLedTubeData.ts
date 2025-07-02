import { useState, useEffect } from 'react';
import { apiService, LedTube } from '@/app/services/api';

export interface UseLedTubeDataReturn {
  tubes: LedTube[];
  baseline: LedTube | null;
  brands: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLedTubeData(): UseLedTubeDataReturn {
  const [tubes, setTubes] = useState<LedTube[]>([]);
  const [baseline, setBaseline] = useState<LedTube | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tubesData, baselineData, brandsData] = await Promise.all([
        apiService.getLedTubes(),
        apiService.getBaselineTube(),
        apiService.getLedBrands()
      ]);
      
      setTubes(tubesData);
      setBaseline(baselineData);
      setBrands(brandsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch LED tube data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    tubes,
    baseline,
    brands,
    loading,
    error,
    refetch: fetchData
  };
}