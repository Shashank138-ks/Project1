from app import app, db, Category, Flavor, Supplier, Customer, Purchase, Bill, BillItem
from datetime import datetime, timedelta
import random

def seed_database():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # Create Categories
        cat1 = Category(name='Classic Flavors')
        cat2 = Category(name='Premium Reserve')
        cat3 = Category(name='Vegan / Sorbets')
        db.session.add_all([cat1, cat2, cat3])
        db.session.commit()

        # 20 Products Data
        products_data = [
            ("Belgian Chocolate", "Rich, dark chocolate made with 70% cocoa Belgian couverture.", 15.00, cat2.id, '/static/choco.png', 4.9, 10),
            ("Sicilian Pistachio", "Authentic roasted Sicilian pistachios with a touch of Mediterranean sea salt.", 18.50, cat2.id, '/static/pistachio.png', 4.8, 0),
            ("Madagascar Vanilla", "Creamy vanilla made with pure Madagascar bourbon vanilla beans.", 12.00, cat1.id, '/static/vanilla.png', 4.7, 5),
            ("Wild Strawberry", "Fresh hand-picked wild strawberries blended into a refreshing scoop.", 11.00, cat1.id, '/static/berry.png', 4.5, 0),
            ("Mint Chocolate Chip", "Cool peppermint ice cream loaded with rich dark chocolate flakes.", 13.00, cat1.id, '/static/mint.png', 4.6, 15),
            ("Salted Caramel Crunch", "Sweet caramel ribbons with crunchy praline pecans and sea salt.", 14.50, cat2.id, '/static/caramel.png', 4.9, 0),
            ("Mango Sorbet", "Alphonso mangoes blended into a smooth, dairy-free refreshing sorbet.", 10.00, cat3.id, '/static/sorbet.png', 4.4, 20),
            ("Cookies & Cream", "Classic sweet cream packed with crushed chocolate sandwich cookies.", 12.50, cat1.id, '/static/vanilla.png', 4.8, 0),
            ("Matcha Green Tea", "Earthy and sweet premium ceremonial grade matcha green tea.", 16.00, cat2.id, '/static/mint.png', 4.3, 0),
            ("Lemon Raspberry", "Zesty lemon sorbet swirled with sweet and tart raspberry puree.", 11.50, cat3.id, '/static/berry.png', 4.5, 10),
            ("Butter Pecan", "Rich buttery ice cream loaded with roasted and salted pecans.", 13.50, cat1.id, '/static/caramel.png', 4.7, 0),
            ("Coffee Espresso", "Bold espresso infused ice cream for the perfect caffeine kick.", 14.00, cat1.id, '/static/choco.png', 4.6, 5),
            ("Coconut Almond", "Creamy coconut milk ice cream with toasted almonds and chocolate chips.", 15.50, cat3.id, '/static/vanilla.png', 4.8, 0),
            ("Blackberry Cabernet", "Sophisticated blend of fresh blackberries and Cabernet Sauvignon.", 19.00, cat2.id, '/static/berry.png', 4.9, 15),
            ("Peanut Butter Fudge", "Creamy peanut butter ice cream swirled with thick chocolate fudge.", 13.00, cat1.id, '/static/choco.png', 4.7, 0),
            ("Lavender Honey", "Delicate floral lavender infused ice cream sweetened with local honey.", 17.00, cat2.id, '/static/vanilla.png', 4.6, 0),
            ("Passionfruit Sorbet", "Tangy, tropical, and completely dairy-free passionfruit delight.", 12.00, cat3.id, '/static/sorbet.png', 4.5, 10),
            ("Rocky Road", "Chocolate ice cream with marshmallows and roasted almonds.", 13.50, cat1.id, '/static/choco.png', 4.7, 5),
            ("White Chocolate Macadamia", "Sweet white chocolate base studded with buttery macadamia nuts.", 16.50, cat2.id, '/static/vanilla.png', 4.8, 0),
            ("Cherry Cordial", "Sweet cream with dark chocolate flakes and whole Bordeaux cherries.", 14.00, cat1.id, '/static/berry.png', 4.6, 20),
        ]

        # Insert 20 Flavors
        for name, desc, price, cat_id, img, rating, discount in products_data:
            f = Flavor(
                name=name,
                description=desc,
                price=price,
                category_id=cat_id,
                image=img,
                rating=rating,
                discount_percent=discount,
                mfd=str(datetime.now().date()),
                stock=50
            )
            db.session.add(f)
        
        db.session.commit()

        # Suppliers & Customers
        s1 = Supplier(name='National Dairy Co.', phone='9876543210', address='123 Milk Street')
        db.session.add(s1)
        
        c1 = Customer(name='Rahul Sharma', phone='9988776655', email='rahul@example.com', address='78 Park Avenue', loyalty_points=150, created_date=str(datetime.now().date()))
        db.session.add(c1)
        db.session.commit()

        print("Successfully seeded 20 premium ice creams and basic data!")

if __name__ == '__main__':
    seed_database()
