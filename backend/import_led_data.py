#!/usr/bin/env python3

import os
import sys

from app import app, db
from models import LedTube

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# LED tube data T8 LED tubes
LED_TUBES_DATA = [
    {
        'name': 'CorePro LEDtube',
        'brand': 'Philips',
        'price': 7.50,
        'watt': 20.0,
        'efficiency': 0.0,  # baseline
        'lifetime': 50000,
        'is_baseline': True
    },
    {
        'name': 'SMART+ WiFi Tube',
        'brand': 'Ledvance',
        'price': 24.50,
        'watt': 18.0,
        'efficiency': 40.0,
        'lifetime': 50000,
        'is_baseline': False
    },
    {
        'name': 'SubstiTUBE T8 LED',
        'brand': 'Osram',
        'price': 49.00,
        'watt': 19.3,
        'efficiency': 90.0,
        'lifetime': 50000,
        'is_baseline': False
    },
    {
        'name': 'MasterConnect LEDtube',
        'brand': 'Philips',
        'price': 87.00,
        'watt': 25.0,
        'efficiency': 55.0,
        'lifetime': 60000,
        'is_baseline': False
    }
]


def import_led_data():
    """Import LED tube data into the database"""

    with app.app_context():
        # Create tables if they don't exist
        db.create_all()

        # Clear existing data (fresh start)
        LedTube.query.delete()
        db.session.commit()
        print("Cleared existing LED tube data.")

        # Import LED tube data
        imported_count = 0

        for tube_data in LED_TUBES_DATA:
            try:
                tube = LedTube(
                    name=tube_data['name'],
                    brand=tube_data['brand'],
                    price=tube_data['price'],
                    watt=tube_data['watt'],
                    efficiency=tube_data['efficiency'],
                    lifetime=tube_data['lifetime'],
                    is_baseline=tube_data['is_baseline']
                )

                db.session.add(tube)
                imported_count += 1

                print(f"Added: {tube_data['name']} ({tube_data['brand']}) - "
                      f"{tube_data['price']} CHF, {tube_data['watt']}W, "
                      f"{tube_data['efficiency']}% efficiency")

            except Exception as e:
                print(f"Error importing {tube_data['name']}: {str(e)}")
                continue

        # Commit all changes
        try:
            db.session.commit()
            print(f"\nSuccessfully imported {imported_count} LED tubes!")

            # Show summary
            print("\nDatabase Summary:")
            baseline = LedTube.query.filter_by(is_baseline=True).first()
            if baseline:
                print(
                    f"   Baseline: {baseline.name} - {baseline.price} CHF, {baseline.watt}W")

            smart_tubes = LedTube.query.filter_by(is_baseline=False).count()
            print(f"   Smart tubes: {smart_tubes}")

            brands = db.session.query(LedTube.brand).distinct().count()
            print(f"   Brands: {brands}")

        except Exception as e:
            db.session.rollback()
            print(f"Error committing to database: {str(e)}")


if __name__ == '__main__':
    print("🔧 LED Tube Data Import Tool")
    print("=" * 40)
    import_led_data()
