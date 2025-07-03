import pandas as pd
import numpy as np
import sqlite3
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from scipy import stats
import warnings
import os
from datetime import datetime
from flask import Flask
from models import db, ElectricityPricePrediction
from sqlalchemy import delete

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
SELECT period, canton, canton_label, category, aidfee, charge, gridusage, energy, total
FROM electricity_prices
"""
df = pd.read_sql_query(query, conn)
conn.close()

# Convert data types
df['period'] = df['period'].astype(int)
df['total'] = pd.to_numeric(df['total'])

print("Data overview:")
print(f"Period: {df['period'].min()}-{df['period'].max()}")
print(f"Cantons: {df['canton_label'].nunique()}")
print(f"Categories: {df['category'].unique()}")
print(f"Number of records: {len(df)}")


class ElectricityPriceForecast:
    def __init__(self, data):
        self.df = data.copy()
        self.forecasts = {}

    def holt_winters_forecast(self, canton, category, periods=16):
        """
        Holt-Winters forecast for a canton and category
        """
        # Filter data for specific canton and category
        subset = self.df[
            (self.df['canton_label'] == canton) &
            (self.df['category'] == category)
            ].copy()

        if len(subset) < 5:  # At least 5 data points required
            print(f"Too few data points for {canton}, {category}: {len(subset)}")
            return None

        # Sort by year
        subset = subset.sort_values('period')
        
        # Get canton code for database storage
        canton_code = subset['canton'].iloc[0]

        # Create time series
        ts = subset.set_index('period')['total']

        try:
            # Try simple exponential smoothing first
            model = ExponentialSmoothing(
                ts,
                trend='add',
                seasonal=None,
                damped_trend=False  # Try without damping first
            )

            fit = model.fit()

            # Forecast for 2025-2040
            forecast = fit.forecast(periods)

            # Years for forecast
            future_years = range(2025, 2025 + periods)
            
            # Check if forecast contains NaN values
            forecast_series = pd.Series(forecast, index=future_years)
            if forecast_series.isna().any():
                print(f"  WARNING: NaN values in Holt-Winters forecast for {canton}, {category}")
                print(f"  Using linear extrapolation as fallback")
                return None  # This will trigger linear extrapolation

            return {
                'historical': ts,
                'forecast': forecast_series,
                'canton_code': canton_code
            }

        except Exception as e:
            print(f"  Holt-Winters error for {canton}, {category}: {e}")
            print(f"  Using linear extrapolation as fallback")
            return None

    def linear_extrapolation(self, canton, category, periods=16):
        """
        Simple linear extrapolation as fallback
        """
        subset = self.df[
            (self.df['canton_label'] == canton) &
            (self.df['category'] == category)
            ].copy()

        if len(subset) < 3:
            print(f"  Too few data points for linear extrapolation: {len(subset)}")
            return None

        subset = subset.sort_values('period')
        
        # Get canton code for database storage
        canton_code = subset['canton'].iloc[0]

        # Linear regression
        x = subset['period'].values
        y = subset['total'].values

        slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

        # Forecast
        future_years = np.array(range(2025, 2025 + periods))
        forecast = slope * future_years + intercept
        
        # Ensure no negative prices
        forecast = np.maximum(forecast, 0.0)
        
        print(f"  Linear extrapolation successful: slope={slope:.4f}, R²={r_value**2:.4f}")

        return {
            'historical': subset.set_index('period')['total'],
            'forecast': pd.Series(forecast, index=future_years),
            'canton_code': canton_code,
            'slope': slope,
            'r_squared': r_value ** 2
        }

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

    def forecast_all_cantons(self):
        """
        Creates forecasts for all cantons and categories
        """
        cantons = self.df['canton_label'].unique()
        categories = self.df['category'].unique()

        results = {}

        for canton in cantons:
            results[canton] = {}

            for category in categories:
                print(f"Processing: {canton}, {category}")

                # Try Holt-Winters first
                forecast = self.holt_winters_forecast(canton, category)

                # If Holt-Winters fails, use linear extrapolation
                if forecast is None:
                    forecast = self.linear_extrapolation(canton, category)

                if forecast is not None:
                    # Create scenarios
                    scenarios = self.create_scenarios(forecast['forecast'])
                    
                    results[canton][category] = {
                        'historical': forecast['historical'],
                        'forecast_base': forecast['forecast'],
                        'scenarios': scenarios,
                        'canton_code': forecast['canton_code']
                    }
                else:
                    print(f"  WARNING: No forecast for {canton}, {category}")

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
                    for scenario_name, scenario_data in data['scenarios'].items():
                        # Debug: Check the structure
                        if isinstance(scenario_data, pd.Series):
                            # Convert pandas Series to dict for iteration
                            for year in scenario_data.index:
                                value = scenario_data[year]
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
                                else:
                                    print(f"  WARNING: NaN value for {canton} {category} {scenario_name} {year}")
                        else:
                            print(f"  ERROR: Unexpected data type for scenario: {type(scenario_data)}")
            
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
    print("\nCreating forecasts for all cantons...")
    results = forecast.forecast_all_cantons()

    # Save to database
    print("\nSaving forecasts to database...")
    forecast.save_to_database()
    
    print("\nForecasts successfully created and saved!")