from flask import Flask, jsonify, request
from flask_cors import CORS

from models import db, ElectricityPrice, LedTube, ElectricityPricePrediction

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://frontend:3000'])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bw-smart-energy.db'
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


@app.route('/api/led-tubes')
def get_led_tubes():
    # Get query parameters
    brand = request.args.get('brand')
    min_efficiency = request.args.get('min_efficiency', type=float)
    max_price = request.args.get('max_price', type=float)

    # Build query
    query = LedTube.query

    if brand:
        query = query.filter(LedTube.brand.ilike(f'%{brand}%'))
    if min_efficiency is not None:
        query = query.filter(LedTube.efficiency >= min_efficiency)
    if max_price is not None:
        query = query.filter(LedTube.price <= max_price)

    # Execute query and return results
    tubes = query.order_by(LedTube.efficiency.desc()).all()

    return jsonify([tube.to_dict() for tube in tubes])


@app.route('/api/led-tubes/baseline')
def get_baseline_tube():
    # Get the baseline LED tube
    baseline = LedTube.query.filter_by(is_baseline=True).first()
    
    if not baseline:
        return jsonify({"error": "No baseline tube found"}), 404
    
    return jsonify(baseline.to_dict())


@app.route('/api/led-tubes/brands')
def get_led_brands():
    # Get unique brands
    brands = db.session.query(LedTube.brand).distinct().order_by(LedTube.brand).all()
    
    return jsonify([brand[0] for brand in brands])


@app.route('/api/predictions')
def get_predictions():
    # Get query parameters
    canton = request.args.get('canton')
    period = request.args.get('period')
    category = request.args.get('category', 'C3')  # Default to C3
    scenario = request.args.get('scenario')  # konservativ, mittel, optimistisch
    
    # Build query
    query = ElectricityPricePrediction.query
    
    if canton:
        query = query.filter_by(canton=canton)
    if period:
        query = query.filter_by(period=period)
    if category:
        query = query.filter_by(category=category)
    if scenario:
        query = query.filter_by(scenario=scenario)
    
    # Execute query and return results
    predictions = query.order_by(
        ElectricityPricePrediction.period,
        ElectricityPricePrediction.scenario
    ).all()
    
    return jsonify({
        "data": [pred.to_dict() for pred in predictions],
        "count": len(predictions)
    })


@app.route('/api/predictions/summary')
def get_predictions_summary():
    # Get average predictions by year across all cantons
    canton = request.args.get('canton')
    category = request.args.get('category', 'C3')
    
    if canton:
        # Get predictions for specific canton
        predictions = db.session.query(
            ElectricityPricePrediction.period,
            ElectricityPricePrediction.scenario,
            ElectricityPricePrediction.predicted_total
        ).filter_by(
            canton=canton,
            category=category
        ).order_by(
            ElectricityPricePrediction.period,
            ElectricityPricePrediction.scenario
        ).all()
    else:
        # Get average predictions across all cantons
        from sqlalchemy import func
        predictions = db.session.query(
            ElectricityPricePrediction.period,
            ElectricityPricePrediction.scenario,
            func.avg(ElectricityPricePrediction.predicted_total).label('predicted_total')
        ).filter_by(
            category=category
        ).group_by(
            ElectricityPricePrediction.period,
            ElectricityPricePrediction.scenario
        ).order_by(
            ElectricityPricePrediction.period,
            ElectricityPricePrediction.scenario
        ).all()
    
    # Transform data into a more convenient format
    result = {}
    for period, scenario, total in predictions:
        if period not in result:
            result[period] = {}
        result[period][scenario] = round(total, 2)
    
    return jsonify(result)


@app.route('/api/predictions/cantons')
def get_prediction_cantons():
    # Get unique cantons that have predictions
    cantons = db.session.query(
        ElectricityPricePrediction.canton,
        ElectricityPricePrediction.canton_label
    ).distinct().order_by(ElectricityPricePrediction.canton).all()
    
    return jsonify([
        {"value": canton, "label": label}
        for canton, label in cantons
    ])


@app.route('/api/predictions/scenarios')
def get_scenarios():
    # Get available scenarios
    scenarios = db.session.query(
        ElectricityPricePrediction.scenario
    ).distinct().order_by(ElectricityPricePrediction.scenario).all()
    
    return jsonify([scenario[0] for scenario in scenarios])


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=5001)
