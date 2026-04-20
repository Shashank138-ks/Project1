from flask import Flask, request, jsonify, render_template
from datetime import datetime, date
import random
import requests
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///adisha_scoop.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

class Supplier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

class Flavor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(500), nullable=False, default='/static/images/placeholder.png')
    is_seasonal = db.Column(db.Boolean, default=False)
    season = db.Column(db.String(50), nullable=True)
    description = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Float, default=4.5)
    discount_percent = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    mfd = db.Column(db.String(50), nullable=True)
    stock = db.Column(db.Integer, default=0)
    category = db.relationship('Category', backref=db.backref('products', lazy=True))

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('flavor.id'), nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('supplier.id'), nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    product = db.relationship('Flavor', backref=db.backref('purchases', lazy=True))
    supplier = db.relationship('Supplier', backref=db.backref('purchases', lazy=True))

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bill_no = db.Column(db.String(50), nullable=False, unique=True)
    date = db.Column(db.String(50), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=True)
    total_amount = db.Column(db.Float, nullable=False)
    gst = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, nullable=False)
    net_bill = db.Column(db.Float, nullable=False)
    customer = db.relationship('Customer', backref=db.backref('bills', lazy=True))

class BillItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bill.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('flavor.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    bill = db.relationship('Bill', backref=db.backref('items', lazy=True))
    product = db.relationship('Flavor')

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
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    address = db.Column(db.String(255), nullable=True)
    loyalty_points = db.Column(db.Integer, default=0)
    created_date = db.Column(db.String(50), nullable=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    order_date = db.Column(db.String(50), nullable=False)
    customer_id = db.Column(db.Integer, nullable=True)

# Static Configurations
weather_flavors = {
    'hot': ['Raspberry Sorbet', 'Lemon Sorbet', 'Orange Sherbet', 'Watermelon', 'Pineapple'],
    'warm': ['Vanilla', 'Chocolate', 'Strawberry', 'Mint Chocolate Chip', 'Cookies & Cream'],
    'cool': ['Coffee', 'Caramel', 'Butter Pecan', 'French Vanilla', 'Rocky Road'],
    'cold': ['Hot Fudge Brownie', 'Death by Chocolate', 'Turtle Soup', 'Triple Caramel Chunk', 'Bourbon Street']
}

business_info = {
    'name': 'ADISHA SCOOP',
    'address': '123 Ice Cream Lane, Sweet City, SC 12345',
    'phone': '+1 (555) 123-SCOOP',
    'email': 'hello@adishascoop.com',
    'hours': {
        'monday': '10:00 AM - 10:00 PM',
        'tuesday': '10:00 AM - 10:00 PM',
        'wednesday': '10:00 AM - 10:00 PM',
        'thursday': '10:00 AM - 10:00 PM',
        'friday': '10:00 AM - 11:00 PM',
        'saturday': '9:00 AM - 11:00 PM',
        'sunday': '11:00 AM - 9:00 PM'
    },
    'social_media': {
        'instagram': '@adishascoop',
        'facebook': 'facebook.com/adishascoop',
        'twitter': '@adishascoop'
    }
}

nutrition_data = {
    'Chocolate': {'calories': 280, 'fat': 16, 'carbs': 32, 'protein': 4, 'allergens': ['milk', 'soy']},
    'Vanilla': {'calories': 250, 'fat': 14, 'carbs': 28, 'protein': 4, 'allergens': ['milk']},
    'Strawberry': {'calories': 220, 'fat': 10, 'carbs': 30, 'protein': 3, 'allergens': ['milk']},
    'Mint': {'calories': 270, 'fat': 15, 'carbs': 31, 'protein': 4, 'allergens': ['milk']},
    'Caramel': {'calories': 310, 'fat': 18, 'carbs': 38, 'protein': 4, 'allergens': ['milk']},
    'Pistachio': {'calories': 320, 'fat': 22, 'carbs': 26, 'protein': 6, 'allergens': ['milk', 'nuts']},
    'Butter Pecan': {'calories': 330, 'fat': 24, 'carbs': 24, 'protein': 5, 'allergens': ['milk', 'nuts']},
    'Cookies & Cream': {'calories': 290, 'fat': 17, 'carbs': 33, 'protein': 4, 'allergens': ['milk', 'wheat', 'soy']},
    'Rocky Road': {'calories': 340, 'fat': 20, 'carbs': 36, 'protein': 5, 'allergens': ['milk', 'nuts']},
    'Coffee': {'calories': 240, 'fat': 12, 'carbs': 29, 'protein': 4, 'allergens': ['milk']}
}

loyalty_rewards = [
    {'points': 100, 'reward': 'Free single scoop'},
    {'points': 250, 'reward': 'Free double scoop'},
    {'points': 500, 'reward': 'Free ice cream cake'},
    {'points': 1000, 'reward': 'VIP membership - 20% off all purchases'}
]

current_promotions = [
    {'id': 1, 'title': 'Student Special', 'description': '20% off with valid student ID', 'valid_until': '2026-12-31', 'code': 'STUDENT20'},
    {'id': 2, 'title': 'Family Bundle', 'description': 'Buy 4 scoops, get 1 free', 'valid_until': '2026-06-30', 'code': 'FAMILY5'},
    {'id': 3, 'title': 'Loyalty Bonus', 'description': 'Double points on all purchases this week', 'valid_until': '2026-04-25', 'code': 'LOYALTY2X'}
]

def get_current_season():
    month = datetime.now().month
    if month in [3, 4, 5]: return 'spring'
    elif month in [6, 7, 8]: return 'summer'
    elif month in [9, 10, 11]: return 'autumn'
    else: return 'winter'

def get_weather_recommendations():
    weather_conditions = ['hot', 'warm', 'cool', 'cold']
    current_weather = random.choice(weather_conditions)
    return {
        'condition': current_weather,
        'recommended_flavors': weather_flavors[current_weather],
        'message': f"Based on today's {current_weather} weather, we recommend these refreshing flavors!"
    }

def calculate_loyalty_points(purchase_amount):
    return int(purchase_amount / 10)

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if username == 'admin' and password == 'admin':
            return jsonify({"status": "success", "role": "admin"})
        return jsonify({"status": "error"})
    return render_template('login.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/management')
def management():
    return render_template('management.html')

# --- MIS API Routes ---
@app.route('/api/categories', methods=['GET', 'POST'])
def handle_categories():
    if request.method == 'POST':
        data = request.json
        cat = Category(name=data['name'])
        db.session.add(cat)
        db.session.commit()
        return jsonify({"message": "Category added!"})
    cats = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in cats])

@app.route('/api/categories/<int:id>', methods=['DELETE', 'PUT'])
def category_detail(id):
    cat = Category.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(cat)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    if request.method == 'PUT':
        cat.name = request.json['name']
        db.session.commit()
        return jsonify({"message": "Updated"})

@app.route('/api/suppliers', methods=['GET', 'POST'])
def handle_suppliers():
    if request.method == 'POST':
        data = request.json
        sup = Supplier(name=data['name'], address=data['address'], phone=data['phone'])
        db.session.add(sup)
        db.session.commit()
        return jsonify({"message": "Supplier added!"})
    sups = Supplier.query.all()
    return jsonify([{'id': s.id, 'name': s.name, 'address': s.address, 'phone': s.phone} for s in sups])

@app.route('/api/suppliers/<int:id>', methods=['DELETE', 'PUT'])
def supplier_detail(id):
    sup = Supplier.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(sup)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    if request.method == 'PUT':
        data = request.json
        sup.name = data.get('name', sup.name)
        sup.address = data.get('address', sup.address)
        sup.phone = data.get('phone', sup.phone)
        db.session.commit()
        return jsonify({"message": "Updated"})

@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'POST':
        data = request.json
        prod = Flavor(
            name=data['name'], 
            price=data['price'], 
            category_id=data.get('category_id'),
            mfd=data.get('mfd'),
            stock=data.get('stock', 0),
            image=data.get('image', '/static/images/placeholder.png')
        )
        db.session.add(prod)
        db.session.commit()
        return jsonify({"message": "Product added!"})
    prods = Flavor.query.all()
    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'price': p.price, 
        'category': p.category.name if p.category else '-', 
        'mfd': p.mfd, 
        'stock': p.stock
    } for p in prods])

@app.route('/api/store_products', methods=['GET'])
def get_store_products():
    prods = Flavor.query.all()
    return jsonify([{
        'id': p.id, 
        'name': p.name, 
        'description': p.description,
        'price': p.price, 
        'image': p.image,
        'rating': p.rating,
        'discount_percent': p.discount_percent,
        'category': p.category.name if p.category else '-'
    } for p in prods])

@app.route('/api/products/<int:id>', methods=['DELETE', 'PUT'])
def product_detail(id):
    prod = Flavor.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(prod)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    if request.method == 'PUT':
        data = request.json
        prod.name = data.get('name', prod.name)
        prod.price = data.get('price', prod.price)
        prod.category_id = data.get('category_id', prod.category_id)
        prod.mfd = data.get('mfd', prod.mfd)
        db.session.commit()
        return jsonify({"message": "Updated"})

@app.route('/api/customers', methods=['GET', 'POST'])
def handle_customers_mis():
    if request.method == 'POST':
        data = request.json
        cust = Customer(
            name=data['name'],
            phone=data['phone'],
            email=data.get('email'),
            address=data.get('address'),
            created_date=datetime.now().strftime('%Y-%m-%d')
        )
        db.session.add(cust)
        db.session.commit()
        return jsonify({"message": "Customer added!"})
    custs = Customer.query.all()
    return jsonify([{
        'id': c.id, 'name': c.name, 'phone': c.phone, 'address': c.address, 'email': c.email
    } for c in custs])

@app.route('/api/customers/<int:id>', methods=['DELETE', 'PUT'])
def customer_detail_mis(id):
    cust = Customer.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(cust)
        db.session.commit()
        return jsonify({"message": "Deleted"})
    if request.method == 'PUT':
        data = request.json
        cust.name = data.get('name', cust.name)
        cust.phone = data.get('phone', cust.phone)
        cust.address = data.get('address', cust.address)
        cust.email = data.get('email', cust.email)
        db.session.commit()
        return jsonify({"message": "Updated"})

@app.route('/api/purchases', methods=['GET', 'POST'])
def handle_purchases():
    if request.method == 'POST':
        data = request.json
        purch = Purchase(
            product_id=data['product_id'],
            supplier_id=data['supplier_id'],
            purchase_price=data['purchase_price'],
            quantity=data['quantity'],
            date=datetime.now().strftime('%Y-%m-%d')
        )
        prod = Flavor.query.get(data['product_id'])
        prod.stock += int(data['quantity'])
        db.session.add(purch)
        db.session.commit()
        return jsonify({"message": "Purchase recorded and stock updated!"})
    
    purchases = Purchase.query.all()
    return jsonify([{
        'id': p.id, 'product': p.product.name if p.product else '', 'supplier': p.supplier.name if p.supplier else '',
        'quantity': p.quantity, 'purchase_price': p.purchase_price, 'date': p.date
    } for p in purchases])

@app.route('/api/bills', methods=['GET', 'POST'])
def handle_bills():
    if request.method == 'POST':
        data = request.json
        bill_no = f"B{datetime.now().strftime('%Y%m%d%H%M%S')}"
        bill = Bill(
            bill_no=bill_no,
            date=datetime.now().strftime('%Y-%m-%d'),
            customer_id=data.get('customer_id') if data.get('customer_id') else None,
            total_amount=data['total_amount'],
            gst=data['gst'],
            discount=data['discount'],
            net_bill=data['net_bill']
        )
        db.session.add(bill)
        db.session.commit()

        for item in data['items']:
            bill_item = BillItem(
                bill_id=bill.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            prod = Flavor.query.get(item['product_id'])
            prod.stock -= int(item['quantity'])
            db.session.add(bill_item)
        
        db.session.commit()
        return jsonify({"message": "Bill generated successfully!", "bill_no": bill_no})
    
    bills = Bill.query.all()
    return jsonify([{
        'id': b.id, 'bill_no': b.bill_no, 'date': b.date,
        'customer': b.customer.name if b.customer else 'Walk-in',
        'net_bill': b.net_bill
    } for b in bills])

@app.route('/api/stock', methods=['GET'])
def view_stock():
    prods = Flavor.query.all()
    return jsonify([{
        'id': p.id, 'category': p.category.name if p.category else 'N/A',
        'product_name': p.name, 'stock': p.stock
    } for p in prods])

# API Routes
@app.route('/flavors')
def flavors():
    # Return all flavors
    all_flavors = Flavor.query.all()
    flavors_list = [{
        'id': f.id, 'name': f.name, 'price': f.price, 
        'image': f.image, 'seasonal': f.is_seasonal, 'description': f.description
    } for f in all_flavors]
    return jsonify(flavors_list)

@app.route('/seasonal-flavors')
def seasonal_flavors_route():
    season = get_current_season()
    seasonal_flavors = Flavor.query.filter_by(is_seasonal=True, season=season).all()
    flavors_list = [{
        'id': f.id, 'name': f.name, 'price': f.price, 
        'image': f.image, 'seasonal': f.is_seasonal, 'description': f.description
    } for f in seasonal_flavors]
    return jsonify(flavors_list)

@app.route('/weather-recommendations')
def weather_recommendations():
    return jsonify(get_weather_recommendations())

@app.route('/business-info')
def business_info_route():
    return jsonify(business_info)

@app.route('/nutrition/<flavor_name>')
def get_nutrition(flavor_name):
    nutrition = nutrition_data.get(flavor_name, {
        'calories': 'N/A',
        'fat': 'N/A',
        'carbs': 'N/A',
        'protein': 'N/A',
        'allergens': ['Information not available']
    })
    return jsonify(nutrition)

@app.route('/reviews')
def get_reviews():
    reviews = Review.query.all()
    reviews_list = [{
        'id': r.id, 'flavor': r.flavor_name, 'customer': r.customer,
        'rating': r.rating, 'review': r.review, 'date': r.date
    } for r in reviews]
    return jsonify(reviews_list)

@app.route('/reviews', methods=['POST'])
def add_review():
    data = request.json
    new_review = Review(
        flavor_name=data['flavor'],
        customer=data['customer'],
        rating=data['rating'],
        review=data['review'],
        date=datetime.now().strftime('%Y-%m-%d')
    )
    db.session.add(new_review)
    db.session.commit()
    return jsonify({"message": "Review added successfully"})

@app.route('/loyalty-rewards')
def get_loyalty_rewards():
    return jsonify(loyalty_rewards)

@app.route('/promotions')
def get_promotions():
    return jsonify(current_promotions)

@app.route('/analytics')
def get_analytics():
    total_orders = Order.query.count()
    orders = Order.query.all()
    total_revenue = sum(o.price for o in orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

    flavor_counts = {}
    for o in orders:
        flavor_counts[o.item] = flavor_counts.get(o.item, 0) + 1
    popular_flavors = sorted(flavor_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    total_customers = Customer.query.count()
    
    reviews = Review.query.all()
    total_reviews = len(reviews)
    average_rating = round(sum(r.rating for r in reviews) / total_reviews, 1) if total_reviews > 0 else 0

    analytics = {
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'average_order_value': round(avg_order_value, 2),
        'popular_flavors': popular_flavors,
        'total_customers': total_customers,
        'total_reviews': total_reviews,
        'average_rating': average_rating
    }
    return jsonify(analytics)

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    total_amount = sum(item['price'] for item in data['cart'])

    for item in data['cart']:
        new_order = Order(
            item=item['name'],
            price=item['price'],
            order_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            customer_id=data.get('customer_id')
        )
        db.session.add(new_order)
    
    points_earned = calculate_loyalty_points(total_amount)

    if data.get('customer_id'):
        customer = Customer.query.get(data['customer_id'])
        if customer:
            customer.loyalty_points += points_earned

    db.session.commit()

    return jsonify({
        "message": "Order Placed Successfully",
        "points_earned": points_earned,
        "total_amount": total_amount
    })

@app.route('/admin/customers')
def customers():
    customers_db = Customer.query.all()
    cust_list = [{
        'id': c.id, 'name': c.name, 'email': c.email, 'phone': c.phone,
        'loyalty_points': c.loyalty_points, 'created_date': c.created_date
    } for c in customers_db]
    return jsonify(cust_list)

@app.route('/customer/<int:customer_id>')
def get_customer_profile(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    customer_orders = Order.query.filter_by(customer_id=customer_id).all()
    total_spent = sum(o.price for o in customer_orders)
    
    orders_list = [{
        'id': o.id, 'item': o.item, 'price': o.price, 'order_date': o.order_date
    } for o in customer_orders]

    favorite_flavor = None
    if customer_orders:
        flavor_counts = {}
        for o in customer_orders:
            flavor_counts[o.item] = flavor_counts.get(o.item, 0) + 1
        favorite_flavor = max(flavor_counts, key=flavor_counts.get)

    profile = {
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone,
        'loyalty_points': customer.loyalty_points,
        'created_date': customer.created_date,
        'order_history': orders_list,
        'total_orders': len(orders_list),
        'total_spent': total_spent,
        'favorite_flavor': favorite_flavor
    }
    return jsonify(profile)

@app.route('/customer/login', methods=['POST'])
def customer_login():
    data = request.json
    email = data.get('email')
    phone = data.get('phone')

    customer = None
    if email:
        customer = Customer.query.filter_by(email=email).first()
    elif phone:
        customer = Customer.query.filter_by(phone=phone).first()

    if customer:
        return jsonify({"status": "success", "customer": {
            'id': customer.id, 'name': customer.name, 'email': customer.email, 
            'phone': customer.phone, 'loyalty_points': customer.loyalty_points
        }})
    return jsonify({"status": "error", "message": "Customer not found"}), 404

if __name__ == '__main__':
    with app.app_context():
        # Drop and recreate for schema updates
        db.drop_all()
        db.create_all()
    app.run(debug=True)
