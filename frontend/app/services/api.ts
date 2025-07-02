const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ElectricityPriceRecord {
  id: number;
  period: string;
  canton: string;
  cantonLabel: string;
  category: string;
  aidfee: number;
  charge: number;
  gridusage: number;
  energy: number;
  total: number;
}

export interface Canton {
  code: string;
  label: string;
}

export interface LedTube {
  id: number;
  name: string;
  brand: string;
  price: number;
  watt: number;
  efficiency: number;
  isBaseline: boolean;
}

export interface TrendData {
  year: number;
  total: number;
}

export interface ComponentData {
  aidfee: number;
  charge: number;
  gridusage: number;
  energy: number;
}

export interface CategoryData {
  trend: TrendData[];
  comp24: ComponentData;
}

export interface ElectricityData {
  [canton: string]: {
    [category: string]: CategoryData;
  };
}

const CANTON_CODE_MAP: Record<string, string> = {
  '1': 'ZH', '2': 'BE', '3': 'LU', '4': 'UR', '5': 'SZ', '6': 'OW',
  '7': 'NW', '8': 'GL', '9': 'ZG', '10': 'FR', '11': 'SO', '12': 'BS',
  '13': 'BL', '14': 'SH', '15': 'AR', '16': 'AI', '17': 'SG', '18': 'GR',
  '19': 'AG', '20': 'TG', '21': 'TI', '22': 'VD', '23': 'VS', '24': 'NE',
  '25': 'GE', '26': 'JU'
};

const CANTON_ABBR_TO_CODE = Object.fromEntries(
  Object.entries(CANTON_CODE_MAP).map(([code, abbr]) => [abbr, code])
);

export class ApiService {
  private async fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url: string;
    
    if (API_BASE_URL) {
      // Full URL with base URL
      const fullUrl = new URL(`${API_BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) fullUrl.searchParams.append(key, value);
        });
      }
      url = fullUrl.toString();
    } else {
      // Relative URL for same-origin requests
      url = endpoint;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getPrices(canton?: string, period?: string, category?: string): Promise<ElectricityPriceRecord[]> {
    const params: Record<string, string> = {};
    if (canton && CANTON_ABBR_TO_CODE[canton]) {
      params.canton = CANTON_ABBR_TO_CODE[canton];
    }
    if (period) params.period = period;
    if (category) params.category = category;
    
    const response = await this.fetchApi<{data: ElectricityPriceRecord[], count: number}>('/api/prices', params);
    return response.data;
  }

  async getCantons(): Promise<Canton[]> {
    const cantons = await this.fetchApi<Array<{value: string, label: string}>>('/api/cantons');
    return cantons.map(canton => ({
      code: CANTON_CODE_MAP[canton.value] || canton.value,
      label: canton.label
    }));
  }

  async getYears(): Promise<string[]> {
    return this.fetchApi<string[]>('/api/years');
  }

  async getLedTubes(brand?: string, minEfficiency?: number, maxPrice?: number): Promise<LedTube[]> {
    const params: Record<string, string> = {};
    if (brand) params.brand = brand;
    if (minEfficiency !== undefined) params.min_efficiency = minEfficiency.toString();
    if (maxPrice !== undefined) params.max_price = maxPrice.toString();
    
    return this.fetchApi<LedTube[]>('/api/led-tubes', params);
  }

  async getBaselineTube(): Promise<LedTube> {
    return this.fetchApi<LedTube>('/api/led-tubes/baseline');
  }

  async getLedBrands(): Promise<string[]> {
    return this.fetchApi<string[]>('/api/led-tubes/brands');
  }

  transformToFakeDataStructure(records: ElectricityPriceRecord[]): ElectricityData {
    const result: ElectricityData = {};
    
    // Group records by category for debugging
    const byCategory = records.reduce((acc, record) => {
      if (!acc[record.category]) acc[record.category] = 0;
      acc[record.category]++;
      return acc;
    }, {} as Record<string, number>);
    console.log('Records by category:', byCategory);
    
    records.forEach(record => {
      const cantonAbbr = CANTON_CODE_MAP[record.canton] || record.canton;
      
      // Initialize canton if it doesn't exist
      if (!result[cantonAbbr]) {
        result[cantonAbbr] = {};
      }
      
      // Initialize category if it doesn't exist
      if (!result[cantonAbbr][record.category]) {
        result[cantonAbbr][record.category] = {
          trend: [],
          comp24: {
            aidfee: 0,
            charge: 0,
            gridusage: 0,
            energy: 0
          }
        };
      }
      
      // Add trend data
      result[cantonAbbr][record.category].trend.push({
        year: parseInt(record.period),
        total: record.total
      });
      
      // Update comp24 with 2024 data
      if (record.period === '2024') {
        result[cantonAbbr][record.category].comp24 = {
          aidfee: record.aidfee || 0,
          charge: record.charge || 0,
          gridusage: record.gridusage || 0,
          energy: record.energy || 0
        };
      }
    });
    
    // Sort trend data and ensure all required combinations exist
    Object.keys(result).forEach((cantonKey) => {
      const canton = result[cantonKey];
      
      // Ensure both C2 and C3 categories exist for each canton
      ['C2', 'C3'].forEach(category => {
        if (!canton[category]) {
          canton[category] = {
            trend: [],
            comp24: {
              aidfee: 0,
              charge: 0,
              gridusage: 0,
              energy: 0
            }
          };
        }
        
        // Sort trend data by year
        canton[category].trend.sort((a, b) => a.year - b.year);
      });
    });
    
    return result;
  }
}

export const apiService = new ApiService();