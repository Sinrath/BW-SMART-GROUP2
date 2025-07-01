# BW-SMART-GROUP2

# Electricity Price Data Management

## Setup Database

1. Install dependencies:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Import all data (29 cantons × 15 years):
   ```bash
   python import_data.py
   ```
   This will fetch all electricity price data from 2010-2024 for all Swiss cantons.

## API Endpoints

- `GET /api/prices` - Get electricity prices
  - Query params: `canton`, `period`, `category`
  - Example: `/api/prices?canton=1&period=2024&category=C3`

- `GET /api/cantons` - Get list of all cantons

- `GET /api/years` - Get list of available years

## Database Structure

The SQLite database stores:
- Period (year)
- Canton (1-26)
- Canton label (name)
- Category (C2 = 30’000 kWh/year, C3 = 150’000 kWh/year)
- Price components: aidfee, charge, gridusage, energy, total
