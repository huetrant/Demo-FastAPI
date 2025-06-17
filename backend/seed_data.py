#!/usr/bin/env python3
"""
Script to seed the database with sample data
"""
import asyncio
from sqlmodel import Session, select
from app.core.db import engine
from app.models import Category, Product, Store, Customer, Order, Variant
import uuid
from datetime import datetime

def seed_categories(session: Session):
    """Seed categories"""
    categories_data = [
        {"name_cat": "Beverages", "description": "All kinds of drinks and beverages"},
        {"name_cat": "Coffee", "description": "Coffee products and related items"},
        {"name_cat": "Tea", "description": "Tea varieties and tea-based products"},
        {"name_cat": "Smoothies", "description": "Fruit smoothies and healthy drinks"},
        {"name_cat": "Snacks", "description": "Light snacks and quick bites"},
    ]
    
    for cat_data in categories_data:
        # Check if category already exists
        existing = session.exec(select(Category).where(Category.name_cat == cat_data["name_cat"])).first()
        if not existing:
            category = Category(**cat_data)
            session.add(category)
    
    session.commit()
    print("✅ Categories seeded")

def seed_stores(session: Session):
    """Seed stores"""
    stores_data = [
        {
            "name_store": "Downtown Coffee Shop",
            "address": "123 Main Street, Downtown",
            "phone": "+1-555-0101",
            "open_close": "6:00 AM - 10:00 PM"
        },
        {
            "name_store": "University Campus Store",
            "address": "456 University Ave, Campus",
            "phone": "+1-555-0102",
            "open_close": "7:00 AM - 9:00 PM"
        },
        {
            "name_store": "Mall Food Court",
            "address": "789 Shopping Mall, Level 2",
            "phone": "+1-555-0103",
            "open_close": "10:00 AM - 10:00 PM"
        },
        {
            "name_store": "Airport Terminal",
            "address": "Airport Terminal 1, Gate A",
            "phone": "+1-555-0104",
            "open_close": "5:00 AM - 11:00 PM"
        }
    ]
    
    for store_data in stores_data:
        # Check if store already exists
        existing = session.exec(select(Store).where(Store.name_store == store_data["name_store"])).first()
        if not existing:
            store = Store(**store_data)
            session.add(store)
    
    session.commit()
    print("✅ Stores seeded")

def seed_customers(session: Session):
    """Seed customers"""
    customers_data = [
        {
            "name": "John Doe",
            "username": "johndoe",
            "password": "password123",
            "sex": "male",
            "age": 28,
            "location": "New York, NY",
            "picture": "https://randomuser.me/api/portraits/men/1.jpg"
        },
        {
            "name": "Jane Smith",
            "username": "janesmith",
            "password": "password123",
            "sex": "female",
            "age": 25,
            "location": "Los Angeles, CA",
            "picture": "https://randomuser.me/api/portraits/women/1.jpg"
        },
        {
            "name": "Mike Johnson",
            "username": "mikejohnson",
            "password": "password123",
            "sex": "male",
            "age": 32,
            "location": "Chicago, IL",
            "picture": "https://randomuser.me/api/portraits/men/2.jpg"
        },
        {
            "name": "Sarah Wilson",
            "username": "sarahwilson",
            "password": "password123",
            "sex": "female",
            "age": 29,
            "location": "Houston, TX",
            "picture": "https://randomuser.me/api/portraits/women/2.jpg"
        }
    ]
    
    for customer_data in customers_data:
        # Check if customer already exists
        existing = session.exec(select(Customer).where(Customer.username == customer_data["username"])).first()
        if not existing:
            customer = Customer(**customer_data)
            session.add(customer)
    
    session.commit()
    print("✅ Customers seeded")

def seed_products(session: Session):
    """Seed products"""
    # Get categories
    categories = session.exec(select(Category)).all()
    if not categories:
        print("❌ No categories found. Please seed categories first.")
        return
    
    products_data = [
        {
            "name": "Espresso",
            "descriptions": "Rich and bold espresso shot",
            "link_image": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300",
            "categories_id": categories[1].id  # Coffee
        },
        {
            "name": "Cappuccino",
            "descriptions": "Classic cappuccino with steamed milk foam",
            "link_image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300",
            "categories_id": categories[1].id  # Coffee
        },
        {
            "name": "Green Tea Latte",
            "descriptions": "Smooth green tea with steamed milk",
            "link_image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300",
            "categories_id": categories[2].id  # Tea
        },
        {
            "name": "Berry Smoothie",
            "descriptions": "Fresh mixed berry smoothie",
            "link_image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300",
            "categories_id": categories[3].id  # Smoothies
        }
    ]
    
    for product_data in products_data:
        # Check if product already exists
        existing = session.exec(select(Product).where(Product.name == product_data["name"])).first()
        if not existing:
            product = Product(**product_data)
            session.add(product)
    
    session.commit()
    print("✅ Products seeded")

def seed_variants(session: Session):
    """Seed variants"""
    # Get products
    products = session.exec(select(Product)).all()
    if not products:
        print("❌ No products found. Please seed products first.")
        return

    variants_data = [
        {
            "product_id": products[0].id,  # Espresso
            "beverage_option": "Single Shot",
            "calories": 5,
            "caffeine_mg": 63,
            "price": 2.50,
            "sales_rank": 1
        },
        {
            "product_id": products[0].id,  # Espresso
            "beverage_option": "Double Shot",
            "calories": 10,
            "caffeine_mg": 126,
            "price": 3.50,
            "sales_rank": 2
        },
        {
            "product_id": products[1].id,  # Cappuccino
            "beverage_option": "Small (8oz)",
            "calories": 120,
            "caffeine_mg": 75,
            "price": 4.50,
            "sales_rank": 1
        },
        {
            "product_id": products[1].id,  # Cappuccino
            "beverage_option": "Large (12oz)",
            "calories": 180,
            "caffeine_mg": 150,
            "price": 5.50,
            "sales_rank": 2
        },
        {
            "product_id": products[2].id,  # Green Tea Latte
            "beverage_option": "Hot",
            "calories": 200,
            "caffeine_mg": 25,
            "price": 4.75,
            "sales_rank": 1
        },
        {
            "product_id": products[2].id,  # Green Tea Latte
            "beverage_option": "Iced",
            "calories": 190,
            "caffeine_mg": 25,
            "price": 4.75,
            "sales_rank": 2
        }
    ]

    for variant_data in variants_data:
        variant = Variant(**variant_data)
        session.add(variant)

    session.commit()
    print("✅ Variants seeded")

def seed_orders(session: Session):
    """Seed orders"""
    # Get customers and stores
    customers = session.exec(select(Customer)).all()
    stores = session.exec(select(Store)).all()
    
    if not customers or not stores:
        print("❌ No customers or stores found. Please seed them first.")
        return
    
    orders_data = [
        {
            "customer_id": customers[0].id,
            "store_id": stores[0].id,
            "total_amount": 15.50,
            "order_date": datetime(2024, 1, 15)
        },
        {
            "customer_id": customers[1].id,
            "store_id": stores[1].id,
            "total_amount": 22.75,
            "order_date": datetime(2024, 1, 16)
        },
        {
            "customer_id": customers[2].id,
            "store_id": stores[0].id,
            "total_amount": 8.25,
            "order_date": datetime(2024, 1, 17)
        }
    ]
    
    for order_data in orders_data:
        order = Order(**order_data)
        session.add(order)
    
    session.commit()
    print("✅ Orders seeded")

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")

    with Session(engine) as session:
        seed_categories(session)
        seed_stores(session)
        seed_customers(session)
        seed_products(session)
        seed_variants(session)
        seed_orders(session)

    print("🎉 Database seeding completed!")

if __name__ == "__main__":
    main()
