from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class ElectricityPrice(db.Model):
    __tablename__ = 'electricity_prices'

    id = db.Column(db.Integer, primary_key=True)
    period = db.Column(db.String(4), nullable=False)
    canton = db.Column(db.String(2), nullable=False)
    canton_label = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(10), nullable=False)
    aidfee = db.Column(db.Float)
    charge = db.Column(db.Float)
    gridusage = db.Column(db.Float)
    energy = db.Column(db.Float)
    total = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Create compound index for efficient queries
    __table_args__ = (
        db.Index('idx_canton_period_category', 'canton', 'period', 'category'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'period': self.period,
            'canton': self.canton,
            'cantonLabel': self.canton_label,
            'category': self.category,
            'aidfee': self.aidfee,
            'charge': self.charge,
            'gridusage': self.gridusage,
            'energy': self.energy,
            'total': self.total
        }


class LedTube(db.Model):
    __tablename__ = 'led_tubes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    watt = db.Column(db.Float, nullable=False)
    efficiency = db.Column(db.Float, nullable=False)  # 0-100 (percentage more efficient than base)
    lifetime = db.Column(db.Integer, nullable=False)  # in hours
    is_baseline = db.Column(db.Boolean, default=False)  # True for base LED tube
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'price': self.price,
            'watt': self.watt,
            'efficiency': self.efficiency,
            'lifetime': self.lifetime,
            'isBaseline': self.is_baseline
        }


class ElectricityPricePrediction(db.Model):
    __tablename__ = 'electricity_price_predictions'

    id = db.Column(db.Integer, primary_key=True)
    period = db.Column(db.String(4), nullable=False)  # Year as string
    canton = db.Column(db.String(2), nullable=False)
    canton_label = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(10), nullable=False)
    scenario = db.Column(db.String(20), nullable=False)  # 'konservativ', 'mittel', 'optimistisch'
    predicted_total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Create compound index for efficient queries
    __table_args__ = (
        db.Index('idx_canton_period_category_scenario', 'canton', 'period', 'category', 'scenario'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'period': self.period,
            'canton': self.canton,
            'cantonLabel': self.canton_label,
            'category': self.category,
            'scenario': self.scenario,
            'predictedTotal': self.predicted_total,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
