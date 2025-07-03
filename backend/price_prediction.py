import os
import warnings
import numpy as np
import pandas as pd
import sqlite3
from datetime import datetime
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from flask import Flask
from sqlalchemy import delete
from models import db, ElectricityPricePrediction

warnings.filterwarnings('ignore')

# Flask app setup for database operations
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bw-smart-energy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

# Connect to SQLite database to read data
db_path = os.path.join('instance', 'bw-smart-energy.db')
conn = sqlite3.connect(db_path)

# Load data from database
query = """
        SELECT period, canton, canton_label, category, total
        FROM electricity_prices \
        """
df = pd.read_sql_query(query, conn)
conn.close()

# Convert data types
df['period'] = df['period'].astype(int)
df['total'] = pd.to_numeric(df['total'], errors='coerce')

print("Data overview:")
print(f"Period: {df['period'].min()}-{df['period'].max()}")
print(f"Cantons: {df['canton_label'].nunique()}")
print(f"Categories: {df['category'].unique()}")
print(f"Number of records: {len(df)}")
print()


class ElectricityPriceForecast:
    def __init__(self, data):
        self.df = data.copy()
        self.forecasts = {}

    def holt_winters_forecast(self, ts, periods):
        """
        Holt-Winters forecast with estimated initialization
        """
        model = ExponentialSmoothing(
            ts,
            trend='add',
            seasonal=None,
            damped_trend=True,
            initialization_method='estimated'
        )
        fit = model.fit(optimized=True)
        return fit.forecast(periods)


    def create_scenarios(self, base_forecast, adjustment=0.2):
        """
        Creates optimistic, medium and conservative scenarios
        adjustment: +/- 20% adjustment
        """
        return {
            'konservativ': base_forecast * (1 - adjustment),
            'mittel': base_forecast,
            'optimistisch': base_forecast * (1 + adjustment)
        }

    def forecast_all_cantons(self, start=2025, end=2040):
        """
        Creates forecasts for all cantons and categories
        """
        periods = end - start + 1
        cantons = self.df['canton_label'].unique()
        categories = self.df['category'].unique()

        results = {}

        for canton in cantons:
            results[canton] = {}

            for category in categories:
                print(f"Processing: {canton}, {category}")

                # Filter data for specific canton and category
                subset = self.df[
                    (self.df['canton_label'] == canton) &
                    (self.df['category'] == category)
                    ].copy()

                if len(subset) < 5:  # At least 5 data points required
                    print(
                        f"  Too few data points for {canton}, {category}: {len(subset)}")
                    continue

                # Sort by year and get canton code
                subset = subset.sort_values('period')
                canton_code = subset['canton'].iloc[0]

                # Build annual time series with proper frequency
                datetime_index = pd.to_datetime(subset['period'].astype(str),
                                                format='%Y')
                ts = pd.Series(subset['total'].values,
                               index=datetime_index).asfreq('AS')

                # Skip flat series
                if ts.std() < 0.01:
                    print(
                        f"  WARNING: Little price variation for {canton}, {category}")
                    continue

                # Use Holt-Winters forecasting
                base_forecast = self.holt_winters_forecast(ts, periods)
                method = "Holt-Winters"

                print(f"  {method} successful for {canton}, {category}")

                # Set proper year index for forecasts
                future_years = np.arange(start, end + 1)
                base_forecast.index = future_years

                # Create scenarios
                scenarios = self.create_scenarios(base_forecast)

                results[canton][category] = {
                    'historical': ts.rename_axis('period'),
                    'forecast_base': base_forecast,
                    'scenarios': scenarios,
                    'canton_code': canton_code
                }

        self.forecasts = results
        return results

    def save_to_database(self):
        """
        Saves all forecasts to the database
        """
        with app.app_context():
            # Delete old forecasts
            db.session.execute(delete(ElectricityPricePrediction))
            db.session.commit()

            saved_count = 0

            for canton, categories in self.forecasts.items():
                for category, data in categories.items():
                    if 'scenarios' not in data:
                        continue

                    canton_code = data['canton_code']

                    # Save all scenarios
                    for scenario_name, scenario_data in data[
                        'scenarios'].items():
                        for year, value in scenario_data.items():
                            if pd.notna(value):  # Check if value is not NaN
                                prediction = ElectricityPricePrediction(
                                    period=str(year),
                                    canton=str(canton_code),
                                    canton_label=canton,
                                    category=category,
                                    scenario=scenario_name,
                                    predicted_total=float(value),
                                    created_at=datetime.utcnow()
                                )
                                db.session.add(prediction)
                                saved_count += 1

            db.session.commit()
            print(f"\n{saved_count} forecasts saved to database.")

            # Show sample forecasts
            sample = db.session.query(ElectricityPricePrediction).filter_by(
                canton_label='Zürich',
                category='C2',
                period='2025'
            ).all()

            print("\nSample forecasts for Zürich C2 in 2025:")
            for s in sample:
                print(f"  {s.scenario}: {s.predicted_total:.2f} Rp/kWh")


# Main execution
if __name__ == "__main__":
    # Create forecast object
    forecast = ElectricityPriceForecast(df)

    # Create forecasts for all cantons
    print("Creating forecasts for all cantons...")
    results = forecast.forecast_all_cantons(2025, 2040)

    # Save to database
    print("\nSaving forecasts to database...")
    forecast.save_to_database()

    print("\nForecasts successfully created and saved!")
