from flask import Flask, jsonify, request
from flask_cors import CORS

from models import db, ElectricityPrice

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///electricity_prices.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()


@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask backend!"})


@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "service": "Flask API"})


@app.route('/api/prices')
def get_prices():
    # Get query parameters
    canton = request.args.get('canton')
    period = request.args.get('period')
    category = request.args.get('category', 'C3')  # Default to C3

    # Build query
    query = ElectricityPrice.query

    if canton:
        query = query.filter_by(canton=canton)
    if period:
        query = query.filter_by(period=period)
    if category:
        query = query.filter_by(category=category)

    # Execute query and return results
    prices = query.order_by(ElectricityPrice.period.desc()).all()

    return jsonify({
        "data": [price.to_dict() for price in prices],
        "count": len(prices)
    })


@app.route('/api/cantons')
def get_cantons():
    # Get unique cantons
    cantons = db.session.query(
        ElectricityPrice.canton,
        ElectricityPrice.canton_label
    ).distinct().order_by(ElectricityPrice.canton).all()

    return jsonify([
        {"value": canton, "label": label}
        for canton, label in cantons
    ])


@app.route('/api/years')
def get_years():
    # Get available years
    years = db.session.query(
        ElectricityPrice.period
    ).distinct().order_by(ElectricityPrice.period.desc()).all()

    return jsonify([year[0] for year in years])


if __name__ == '__main__':
    app.run(debug=True, port=5000)
