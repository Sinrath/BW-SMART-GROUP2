# BW-SMART Energy Analysis Dashboard

A comprehensive web application for analyzing electricity prices and LED lighting costs in Switzerland, developed for the ZHAW BW-SMART project.

## Project Architecture

```
BW-SMART-GROUP2/
├── frontend/          # Next.js React frontend
├── backend/           # Flask Python backend
├── nginx/             # Nginx reverse proxy configuration
├── docker-compose.yml # Docker orchestration
└── README.md          # This file
```

## Overview

The BW-SMART Dashboard provides intelligent analysis tools for:
- **Electricity price trends** across Swiss cantons
- **LED lighting cost calculations** with smart technology comparisons
- **Future price predictions** using time series analysis
- **Total cost of ownership** analysis over product lifecycles

## Technology Stack

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React hooks and localStorage

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- Statistical Method: Holt-Winters Exponential Smoothing (statsmodels)
- **Data Processing**: Pandas, NumPy
- **APIs**: REST endpoints for data access

## System Architecture

### Three-Layer Architecture
- **Presentation Layer**: Next.js frontend with 5 specialized analysis tools
- **Logic Layer**: Flask REST API with 12 optimized endpoints and business logic
- **Data Layer**: SQLite database with optimized compound indices on (canton, period, category)

### Data Flow
```
ElCom API → Backend Import → SQLite Database → Flask API → Frontend Hooks → React Components → Visualizations
```

## Data Sources & Methodology

### Electricity Price Data
- **Source**: Swiss Federal Electricity Commission (ElCom) API
- **Coverage**: All 26 Swiss cantons (2014-2024)
- **Categories**: C2 (Small Business), C3 (Medium Business)
- **Components**: Grid usage, energy costs, charges, aid fees

### LED Product Data
- **Source**: Curated database of commercial LED products
- **Categories**: Standard LED tubes and Smart LED solutions
- **Metrics**: Power consumption (watts), efficiency gains (%), lifetime (hours)
- **Pricing**: Swiss market prices in CHF

### Price Predictions
- **Algorithm**: Holt-Winters Exponential Smoothing with damped trend
- **Time Horizon**: 2025-2040 forecasts
- **Scenarios**: Conservative (-20%), Medium (base), Optimistic (+20%)
- **Constraints**: Maximum 50% first-year growth, 10% annual growth cap

## Installation & Setup

### Prerequisites
- **Development**: Node.js 18+ and npm, Python 3.8+ and pip
- **Production**: Docker and Docker Compose

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database and import data**:
   ```bash
   python setup_data.py
   ```
   This script will:
   - Import historical electricity prices from ElCom API
   - Import LED product data
   - Generate price predictions using Holt-Winters forecasting

5. **Start the backend server**:
   ```bash
   python app.py
   ```
   Backend runs on `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Docker Deployment

### Development with Docker

1. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```
   This starts:
   - Backend on port 5001
   - Frontend served through nginx on port 80
   - Nginx as reverse proxy

2. **Stop services**:
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **SSL Certificate Setup**:
   Place your SSL certificates in `nginx/ssl/`:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key

2. **Update nginx configuration**:
   ```bash
   cp nginx/nginx.prod.conf nginx/nginx.conf
   ```

3. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### Environment Variables

#### Backend (Flask)
- `FLASK_ENV`: Set to `production` for production deployment

#### Frontend (Next.js)
- `NEXT_PUBLIC_API_URL`: Backend API URL (leave empty for relative paths in production)

## Analysis Tools

### 1. Strompreis-Analyse (Price Analysis)
- **Purpose**: Interactive exploration of electricity price trends
- **Features**: Canton comparison, price component breakdown, temporal analysis
- **Data**: Historical prices (2014-2024) with detailed cost breakdowns

### 2. Historie-Rechner (Historical Calculator)
- **Purpose**: ROI analysis using historical electricity prices
- **Features**: Break-even calculation, cumulative cost visualization
- **Methodology**: Compares LED vs smart LED costs over actual price history

### 3. Prognose-Rechner (Prediction Calculator)
- **Purpose**: Future cost analysis using predicted electricity prices
- **Features**: Scenario planning (conservative/medium/optimistic)
- **Methodology**: Holt-Winters forecasting with economic constraints

### 4. Szenario-Vergleich (Canton Comparison)
- **Purpose**: Multi-canton electricity price comparison
- **Features**: Side-by-side analysis, trend visualization
- **Use Case**: Regional investment decision support

### 5. LED-Übersicht (Lifetime Calculator)
- **Purpose**: Total cost of ownership analysis over LED lifetime
- **Features**: 
  - Lifecycle cost comparison
  - Replacement schedule visualization
  - Energy and CO2 savings calculation
  - Break-even analysis over product lifetime
- **Data Integration**: Combines historical (2014-2024) and predicted (2025-2040) prices
- **Assumptions**: 
  - 6,000 operating hours per year
  - 0.1 kg CO2 per kWh (Swiss electricity mix estimate)

## Calculation Methodologies

### Core Formulas

#### Historical Cost Analysis
```
Jährliche Stromkosten = (Effektive Wattzahl × Betriebsstunden) / 1000 × Strompreis [CHF/kWh]
Kumulative Kosten = Anschaffungspreis + Σ(Jährliche Stromkosten)
Break-Even-Point = Schnittpunkt der kumulativen Kostenkurven
```

#### LED Efficiency Calculation
```typescript
const effectiveWatt = tube.watt * (1 - tube.efficiency / 100)
const savings = baseline.watt - lamp.watt
const efficiencyPercentage = Math.round((1 - lamp.watt / baseline.watt) * 100)
```

#### Amortization Calculation
```typescript
function interpolate(s0, s1, l0, l1, year0, install) {
    const d0 = s0 - l0  // Kostendifferenz Jahr 0
    const d1 = s1 - l1  // Kostendifferenz Jahr 1
    const t = d0 / (d0 - d1)  // Interpolationsfaktor
    const xA = year0 + t      // Absolutes Amortisationsjahr
    return { xA, y: s0 + (s1 - s0) * t, rel: xA - install }
}
```

#### CO₂ Impact Calculation
```typescript
const co2PerKWh = 0.1  // kg CO₂ per kWh (Swiss electricity mix)
const manufacturingCO2PerLED = 3.0  // kg CO₂ per LED manufacturing
const totalCO2 = energyConsumption * co2PerKWh + ledCount * manufacturingCO2PerLED
```

### Holt-Winters Price Forecasting
```python
model = ExponentialSmoothing(
    ts,
    trend='add',
    seasonal=None,
    damped_trend=True,
    initialization_method='estimated'
)
fit = model.fit(optimized=True, damping_trend=0.8)
```

## Data Processing Pipeline

### 1. Historical Data Import (`import_electric_price_data.py`)
- **Source**: ElCom API (https://api.elcom.admin.ch)
- **Process**: 
  - Fetches annual electricity prices for all Swiss cantons
  - Extracts price components (grid, energy, charges, fees)
  - Stores data in SQLite database
- **Update Frequency**: Annual (new data typically available in Q3)

### 2. LED Data Import (`import_led_data.py`)
- **Process**: 
  - Loads LED product specifications from predefined dataset
  - Validates technical specifications and pricing
  - Establishes baseline product for comparisons
- **Data Points**: Brand, model, wattage, efficiency, lifetime, price

### 3. Price Prediction (`price_prediction.py`)
- **Algorithm**: Holt-Winters Exponential Smoothing
- **Implementation**:
  - Analyzes historical price trends (2014-2024)
  - Applies damped trend to prevent unrealistic growth
  - Generates three scenarios with +/-20% variation
- **Constraints**:
  - Maximum 50% growth in first year
  - 10% annual growth cap thereafter
  - Ensures realistic long-term projections

## Environmental Impact Notes

The CO2 calculations in the LED-Übersicht tool use an estimated value of **0.1 kg CO2 per kWh** for the Swiss electricity mix. This is a simplified estimate and should be considered indicative rather than precise.

**Note**: These environmental figures are for demonstration purposes and may not reflect current Swiss energy grid carbon intensity.

## Database Schema

### `electricity_prices`
- **period** (STRING): Year (e.g., "2024")
- **canton** (STRING): Canton code (1-26)
- **canton_label** (STRING): Canton name (e.g., "Zürich")
- **category** (STRING): "C2" or "C3"
- **total** (FLOAT): Total price in Rp/kWh
- **Components**: aidfee, charge, gridusage, energy

### `led_tubes`
- **name** (STRING): Product name
- **brand** (STRING): Manufacturer
- **price** (FLOAT): Price in CHF
- **watt** (FLOAT): Power consumption in watts
- **efficiency** (FLOAT): Efficiency improvement percentage (0-100)
- **lifetime** (INTEGER): Lifespan in hours (50,000)
- **is_baseline** (BOOLEAN): Whether this is the reference product

### `electricity_price_predictions`
- **period** (STRING): Forecast year (2025-2040)
- **canton** (STRING): Canton code
- **category** (STRING): "C2" or "C3"
- **scenario** (STRING): "konservativ", "mittel", "optimistisch"
- **predicted_total** (FLOAT): Forecasted price in Rp/kWh

## API Endpoints

### Electricity Data
- `GET /api/prices` - Historical electricity prices
- `GET /api/cantons` - Available cantons
- `GET /api/years` - Available years

### LED Data
- `GET /api/led-tubes` - LED product catalog
- `GET /api/led-tubes/baseline` - Reference LED product
- `GET /api/led-tubes/brands` - Available brands

### Predictions
- `GET /api/predictions` - Detailed prediction data
- `GET /api/predictions/summary` - Aggregated forecasts by year/scenario
- `GET /api/predictions/scenarios` - Available scenarios

## Documentation

### Additional Resources
- **Disposition**: Available at `/puplic/G2_Smart_Living_Disposition.pdf` - Project planning and methodology
- **Academic Work**: Available at `/puplic/XXX` ToDo - Detailed academic documentation
## Future Enhancements

### Data Sources
- Integration with real-time electricity market data
- Expanded LED product database with live pricing
- Integration with Swiss building energy standards

### Analysis Features
- Multi-building portfolio analysis
- Carbon footprint tracking with verified emissions factors
- Integration with renewable energy certificates

### Technical Improvements
- Database optimization for larger datasets
- Caching layer for improved performance
- Mobile app development

## License

This project is developed for the ZHAW BW-SMART research project. Please contact the project maintainers for licensing information.

## Academic Context

**Institution**: Zurich University of Applied Sciences (ZHAW)  
**Project**: BW-SMART - ToDo  
**Focus**: ToDo

## Contributors

Developed by Group 2 for the ZHAW BW-SMART project.

- Arnel Deomic
- Damian Aklin
- Jason Nquyen
- Philipp Schiess

---
