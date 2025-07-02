const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString());
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
    
    return this.fetchApi<ElectricityPriceRecord[]>('/api/prices', params);
  }

  async getCantons(): Promise<Canton[]> {
    const cantons = await this.fetchApi<Array<{code: string, label: string}>>('/api/cantons');
    return cantons.map(canton => ({
      code: CANTON_CODE_MAP[canton.code] || canton.code,
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
    
    records.forEach(record => {
      const cantonAbbr = CANTON_CODE_MAP[record.canton] || record.canton;
      
      if (!result[cantonAbbr]) {
        result[cantonAbbr] = {};
      }
      
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
      
      result[cantonAbbr][record.category].trend.push({
        year: parseInt(record.period),
        total: record.total
      });
      
      if (record.period === '2024') {
        result[cantonAbbr][record.category].comp24 = {
          aidfee: record.aidfee,
          charge: record.charge,
          gridusage: record.gridusage,
          energy: record.energy
        };
      }
    });
    
    Object.values(result).forEach((canton) => {
      Object.values(canton).forEach((category) => {
        category.trend.sort((a, b) => a.year - b.year);
      });
    });
    
    return result;
  }
}

export const apiService = new ApiService();