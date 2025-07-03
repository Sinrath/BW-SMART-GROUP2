#!/usr/bin/env python3
"""
Data Setup Script for BW-SMART Backend
=====================================

This script sets up the complete database with:
1. Historical electricity price data from Swiss API
2. LED tube product data
3. Price predictions using Holt-Winters forecasting

"""

import sys
import os
import subprocess
import time
from datetime import datetime


def log_step(step_name, step_number, total_steps):
    """Log the current step with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n{'=' * 60}")
    print(f"[{timestamp}] Step {step_number}/{total_steps}: {step_name}")
    print(f"{'=' * 60}")


def run_script(script_path, description):
    """Run a Python script and handle errors"""
    try:
        print(f"Running: {script_path}")
        result = subprocess.run([sys.executable, script_path],
                                capture_output=True, text=True, timeout=300)

        if result.returncode == 0:
            print(f"SUCCESS: {description} completed successfully")
            if result.stdout:
                print("Output:", result.stdout)
        else:
            print(f"ERROR: {description} failed!")
            print("Error output:", result.stderr)
            return False

    except subprocess.TimeoutExpired:
        print(f"ERROR: {description} timed out after 5 minutes")
        return False
    except Exception as e:
        print(f"ERROR: {description} failed with exception: {e}")
        return False

    return True


def main():
    """Main setup process"""
    print("Starting BW-SMART Backend Data Setup")
    print(f"Working directory: {os.getcwd()}")

    # Check if we're in the correct directory
    if not os.path.exists("app.py"):
        print(
            "ERROR: app.py not found. Please run this script from the backend directory.")
        sys.exit(1)

    # Define the setup steps
    setup_steps = [
        ("import_electric_price_data.py",
         "Import Historical Electricity Price Data"),
        ("import_led_data.py", "Import LED Tube Product Data"),
        ("price_prediction.py", "Generate Price Predictions with Holt-Winters")
    ]

    total_steps = len(setup_steps)
    successful_steps = 0

    start_time = time.time()

    # Execute each step
    for i, (script_name, description) in enumerate(setup_steps, 1):
        log_step(description, i, total_steps)

        if os.path.exists(script_name):
            success = run_script(script_name, description)
            if success:
                successful_steps += 1
            else:
                print(f"\nERROR: Setup failed at step {i}: {description}")
                print(
                    "Please check the error messages above and fix the issues.")
                sys.exit(1)
        else:
            print(f"ERROR: Script not found: {script_name}")
            sys.exit(1)

    # Summary
    end_time = time.time()
    duration = end_time - start_time

    print(f"\n{'=' * 60}")
    print("BW-SMART Backend Data Setup Complete!")
    print(f"{'=' * 60}")
    print(f"Successfully completed {successful_steps}/{total_steps} steps")
    print(f"Total time: {duration:.1f} seconds")
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Verify database exists
    if os.path.exists("instance/bw-smart-energy.db"):
        print("Database file created: instance/bw-smart-energy.db")
    else:
        print(
            "WARNING: Database file not found at instance/bw-smart-energy.db")

    print("\nBackend is ready to serve requests!")


if __name__ == "__main__":
    main()
