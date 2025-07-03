# BW-SMART Energy Analysis Dashboard

A comprehensive web application for analyzing electricity prices and LED lighting costs in Switzerland, developed for the ZHAW BW-SMART project.

## 🏗️ Project Architecture

```
BW-SMART-GROUP2/
├── frontend/          # Next.js React frontend
├── backend/           # Flask Python backend
└── README.md         # This file
```

## 🎯 Overview

The BW-SMART Dashboard provides intelligent analysis tools for:
- **Electricity price trends** across Swiss cantons
- **LED lighting cost calculations** with smart technology comparisons
- **Future price predictions** using time series analysis
- **Total cost of ownership** analysis over product lifecycles

## 🛠️ Technology Stack

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

## 📊 Data Sources & Methodology

### Electricity Price Data
- **Source**: Swiss Federal Electricity Commission (ElCom) API
- **Coverage**: All 26 Swiss cantons (2014-2024)
- **Categories**: C2 (Small Business), C3 (Medium Business)
- **Components**: Grid usage, energy costs, charges, aid fees

### LED Product Data
- ToDo

### Price Predictions
- **Algorithm**: Holt-Winters Exponential Smoothing with damped trend
- **Time Horizon**: 2025-2040 forecasts
- **Scenarios**: Conservative (-20%), Medium (base), Optimistic (+20%)
- **Constraints**: Maximum 50% first-year growth, 10% annual growth cap

## 🔧 Installation & Setup

### Prerequisites
- **Frontend**: Node.js 18+ and npm
- **Backend**: Python 3.8+ and pip

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

## 📈 Analysis Tools

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
- **Features**: ToDO
- **Data Integration**: Combines historical (2014-2024) and predicted (2025-2040) prices
- **Assumptions**: 
  - 6,000 operating hours per year
  - 0.1 kg CO₂ per kWh (Swiss electricity mix estimate)

## 🔬 Data Processing Pipeline

### 1. Historical Data Import (`import_electric_price_data.py`)
- ToDo

### 2. LED Data Import (`import_led_data.py`)
- ToDo

### 3. Price Prediction (`price_prediction.py`)
- ToDO

## 🌱 Environmental Impact Notes

The CO₂ calculations in the LED-Übersicht tool use an estimated value of **0.1 kg CO₂ per kWh** for the Swiss electricity mix. This is a simplified estimate and should be considered indicative rather than precise.

**Note**: These environmental figures are for demonstration purposes and may not reflect current Swiss energy grid carbon intensity.

## 🗄️ Database Schema

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

## 🚀 API Endpoints

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

## 🔮 Future Enhancements

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

## 📄 License

This project is developed for the ZHAW BW-SMART research project. Please contact the project maintainers for licensing information.

## 🏫 Academic Context

**Institution**: Zurich University of Applied Sciences (ZHAW)  
**Project**: BW-SMART ToDo  
**Focus**: Intelligent energy management and cost optimization for commercial buildings


---

ToDo