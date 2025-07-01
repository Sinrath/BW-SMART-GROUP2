import requests

from app import app, db
from models import ElectricityPrice

# API configuration
url = "https://www.strompreis.elcom.admin.ch/api/graphql"

query = """
query ObservationsWithAllPriceComponents(
  $locale: String!, 
  $filters: ObservationFilters!, 
  $observationKind: ObservationKind
) {
  cantonMedianObservations(
    locale: $locale
    filters: $filters
    observationKind: $observationKind
  ) {
    period
    canton
    cantonLabel
    category
    aidfee: value(priceComponent: aidfee)
    charge: value(priceComponent: charge)
    gridusage: value(priceComponent: gridusage)
    energy: value(priceComponent: energy)
    total: value(priceComponent: total)
  }
}
"""

# All Swiss cantons (1-26)
CANTONS = [str(i) for i in range(1, 27)]

# Years to fetch (2011-2024)
YEARS = [str(year) for year in range(2011, 2025)]

# Categories to fetch (C2 = 30’000 kWh/year, C3 = 150’000 kWh/year)
CATEGORIES = ["C2", "C3"]


def fetch_and_store_data():
    """Fetch electricity price data from API and store in database"""

    with app.app_context():
        # Clear existing data
        ElectricityPrice.query.delete()
        db.session.commit()

        total_records = 0

        # Fetch data for each year
        for year in YEARS:
            print(f"\nFetching data for year {year}...")

            variables = {
                "locale": "de",
                "filters": {
                    "period": [year],
                    "canton": CANTONS,
                    "category": CATEGORIES,
                    "product": ["standard"]
                },
                "observationKind": "Canton"
            }

            try:
                response = requests.post(url, json={
                    "query": query,
                    "operationName": "ObservationsWithAllPriceComponents",
                    "variables": variables
                })

                data = response.json()

                if data.get("data") and data["data"].get(
                        "cantonMedianObservations"):
                    observations = data["data"]["cantonMedianObservations"]

                    for obs in observations:
                        price = ElectricityPrice(
                            period=obs['period'],
                            canton=obs['canton'],
                            canton_label=obs['cantonLabel'],
                            category=obs['category'],
                            aidfee=obs.get('aidfee'),
                            charge=obs.get('charge'),
                            gridusage=obs.get('gridusage'),
                            energy=obs.get('energy'),
                            total=obs.get('total')
                        )
                        db.session.add(price)

                    db.session.commit()
                    total_records += len(observations)
                    print(f"  - Added {len(observations)} records for {year}")
                else:
                    print(f"  - No data found for {year}")

            except Exception as e:
                print(f"  - Error fetching data for {year}: {str(e)}")
                db.session.rollback()

        print(f"\nTotal records imported: {total_records}")


if __name__ == "__main__":
    fetch_and_store_data()
