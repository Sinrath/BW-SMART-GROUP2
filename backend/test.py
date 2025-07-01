import requests

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

variables = {
    "locale": "de",
    "filters": {
        "period": ["2024"],
        "canton": ["1"],
        "category": ["C3"],
        "product": ["standard"]
    },
    "observationKind": "Canton"
}

response = requests.post(url, json={
    "query": query,
    "operationName": "ObservationsWithAllPriceComponents",
    "variables": variables
})

data = response.json()

# Ausgabe der Daten
if data.get("data") and data["data"].get("cantonMedianObservations"):
    for obs in data["data"]["cantonMedianObservations"]:
        print(f"Kanton: {obs['cantonLabel']} ({obs['canton']})")
        print(f"Kategorie: {obs['category']}")
        print(f"Periode: {obs['period']}")
        print(f"- Energie:       {obs['energy']} Rp./kWh")
        print(f"- Netznutzung:   {obs['gridusage']} Rp./kWh")
        print(f"- Abgaben:       {obs['charge']} Rp./kWh")
        print(f"- Total:         {obs['total']} Rp./kWh")
        print("-" * 40)
else:
    print("Keine Daten gefunden.")
