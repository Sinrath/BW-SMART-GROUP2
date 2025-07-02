import { useState, useEffect } from 'react';
import { apiService, ElectricityData } from '@/app/services/api';

export interface UseElectricityDataReturn {
  data: ElectricityData;
  cantons: Array<{code: string, label: string}>;
  years: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useElectricityData(): UseElectricityDataReturn {
  const [data, setData] = useState<ElectricityData>({});
  const [cantons, setCantons] = useState<Array<{code: string, label: string}>>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pricesData, cantonsData, yearsData] = await Promise.all([
        apiService.getPrices(),
        apiService.getCantons(),
        apiService.getYears()
      ]);
      
      const transformedData = apiService.transformToFakeDataStructure(pricesData);
      
      setData(transformedData);
      setCantons(cantonsData);
      setYears(yearsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch electricity data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    cantons,
    years,
    loading,
    error,
    refetch: fetchData
  };
}