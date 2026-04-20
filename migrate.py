import app
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the new app structure for DB migration
migration_app = Flask(__name__)
migration_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///adisha_scoop.db'
migration_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(migration_app)

class Flavor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(500), nullable=False)
    is_seasonal = db.Column(db.Boolean, default=False)
    season = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(500), nullable=True)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    flavor_name = db.Column(db.String(100), nullable=False)
    customer = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    review = db.Column(db.Text, nullable=False)
    date = db.Column(db.String(50), nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    loyalty_points = db.Column(db.Integer, default=0)
    created_date = db.Column(db.String(50), nullable=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    order_date = db.Column(db.String(50), nullable=False)
    customer_id = db.Column(db.Integer, nullable=True)

with migration_app.app_context():
    db.drop_all()
    db.create_all()

    # Seed Flavors
    for f in app.flavors_data:
        db.session.add(Flavor(id=f['id'], name=f['name'], price=f['price'], image=f['image'], is_seasonal=False))
    
    # Seed Seasonal Flavors
    for season, flavors in app.seasonal_flavors.items():
        for f in flavors:
            db.session.add(Flavor(
                id=f['id'], name=f['name'], price=f['price'], image=f['image'], 
                is_seasonal=True, season=season, description=f['description']
            ))

    # Seed Reviews
    for r in app.reviews_data:
        db.session.add(Review(id=r['id'], flavor_name=r['flavor'], customer=r['customer'], rating=r['rating'], review=r['review'], date=r['date']))

    # Seed Customers
    for c in app.customers_data:
        db.session.add(Customer(id=c['id'], name=c['name'], email=c['email'], phone=c['phone'], loyalty_points=c['loyalty_points'], created_date=c['created_date']))

    # Seed Orders
    for o in app.orders_data:
        db.session.add(Order(id=o['id'], item=o['item'], price=o['price'], order_date=o['order_date'], customer_id=o.get('customer_id')))

    db.session.commit()
    print("Database seeded successfully!")
