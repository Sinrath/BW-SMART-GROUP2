#!/usr/bin/env python3

import os
import sys

from app import app, db
from models import LedTube

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# LED tube data - Realistic T8 LED tubes with smart features
LED_TUBES_DATA = [
    {
        'name': 'Standard LED Tube',
        'brand': 'Generic',
        'price': 20.0,
        'watt': 18.0,
        'efficiency': 0.0,  # Baseline = 0% more efficient
        'is_baseline': True
    },
    {
        'name': 'Smart LED Basic (Dimming)',
        'brand': 'Signify',
        'price': 35.0,
        'watt': 16.0,
        'efficiency': 21.0,
        'is_baseline': False
    },
    {
        'name': 'Smart LED with Motion Sensor',
        'brand': 'Osram',
        'price': 45.0,
        'watt': 15.5,
        'efficiency': 33.0,
        'is_baseline': False
    },
    {
        'name': 'Smart LED Daylight Harvesting',
        'brand': 'Philips',
        'price': 55.0,
        'watt': 15.0,
        'efficiency': 55.0,
        'is_baseline': False
    },
    {
        'name': 'IoT Smart LED (Full Control)',
        'brand': 'Cree',
        'price': 65.0,
        'watt': 14.5,
        'efficiency': 81.0,
        'is_baseline': False
    },
    {
        'name': 'Premium Smart LED Suite',
        'brand': 'Acuity Brands',
        'price': 75.0,
        'watt': 14.0,
        'efficiency': 90.0,
        'is_baseline': False
    }
]


def import_led_data():
    """Import LED tube data into the database"""

    with app.app_context():
        # Create tables if they don't exist
        db.create_all()

        # Check if data already exists
        existing_count = LedTube.query.count()
        if existing_count > 0:
            print(f"Found {existing_count} existing LED tubes in database.")
            response = input(
                "Do you want to clear existing data and reimport? (y/N): ")
            if response.lower() == 'y':
                LedTube.query.delete()
                db.session.commit()
                print("Cleared existing LED tube data.")
            else:
                print("Import cancelled.")
                return

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
