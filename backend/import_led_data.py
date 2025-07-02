#!/usr/bin/env python3

import os
import sys

from app import app, db
from models import LedTube

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# LED tube data
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
        'name': 'Nomus Smart LED 50%',
        'brand': 'Nomus',
        'price': 200.0,
        'watt': 7.0,
        'efficiency': 50.0,  # 50% more efficient
        'is_baseline': False
    },
    {
        'name': 'EcoSmart LED 40%',
        'brand': 'EcoSmart',
        'price': 150.0,
        'watt': 8.4,
        'efficiency': 40.0,  # 40% more efficient
        'is_baseline': False
    },
    {
        'name': 'Budget Smart LED 30%',
        'brand': 'Budget',
        'price': 80.0,
        'watt': 9.0,
        'efficiency': 30.0,  # 30% more efficient
        'is_baseline': False
    },
    {
        'name': 'Premium Smart LED 70%',
        'brand': 'Philips',
        'price': 350.0,
        'watt': 5.4,
        'efficiency': 70.0,  # 70% more efficient
        'is_baseline': False
    },
    {
        'name': 'High-End Smart LED 80%',
        'brand': 'Osram',
        'price': 450.0,
        'watt': 3.6,
        'efficiency': 80.0,  # 80% more efficient
        'is_baseline': False
    },
    {
        'name': 'Ultra Efficient LED 90%',
        'brand': 'Cree',
        'price': 600.0,
        'watt': 1.8,
        'efficiency': 90.0,  # 90% more efficient
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
