# BW-SMART-GROUP2

## Technology Stack

### Frontend

- **Framework**: Next.js
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

### Backend

- **Framework**: Flask
- **Sprache**: Python
- **Datenbank**: SQLite
- **ORM**: Flask-SQLAlchemy
- **API-Kommunikation**:
  - Flask-CORS (Cross-Origin Resource Sharing)
  - Requests (für externe API-Aufrufe)
- **Virtuelle Umgebung**: venv

### Datenquelle

- **Externe API**: ElCom Strompreis API (GraphQL)
- **Endpunkt**: https://www.strompreis.elcom.admin.ch/api/graphql

### Projekt-Struktur

```
/
├── frontend/         # Next.js Applikation
│   ├── app/          # App Router
│   └── node_modules/ # JavaScript Dependencies
│
└── backend/          # Flask API Server
    ├── venv/         # Python Virtual Environment
    └── instance/     # SQLite Datenbank
```

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
