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
