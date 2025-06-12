import uuid
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import date, datetime

class Variant(SQLModel, table=True):
    __tablename__ = "variant"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    beverage_option: Optional[str] = Field(default=None)
    calories: Optional[float] = Field(default=None)
    dietary_fibre_g: Optional[float] = Field(default=None)
    sugars_g: Optional[float] = Field(default=None)
    protein_g: Optional[float] = Field(default=None)
    vitamin_a: Optional[str] = Field(default=None)
    vitamin_c: Optional[str] = Field(default=None)
    caffeine_mg: Optional[float] = Field(default=None)
    price: Optional[float] = Field(default=None)
    sales_rank: Optional[int] = Field(default=None)

    product: Optional["Product"] = Relationship(back_populates="variants")

class Store(SQLModel, table=True):
    __tablename__ = "store"

    id: Optional[int] = Field(default=None, primary_key=True)
    name_store: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)
    phone: Optional[str] = Field(default=None)
    open_close: Optional[str] = Field(default=None)

    orders: List["Orders"] = Relationship(back_populates="store")

class OrderDetail(SQLModel, table=True):
    __tablename__ = "order_detail"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: Optional[int] = Field(default=None, foreign_key="orders.id")
    variant_id: Optional[int] = Field(default=None, foreign_key="variant.id")
    quantity: Optional[int] = Field(default=None)
    rate: Optional[float] = Field(default=None)
    unit_price: Optional[float] = Field(default=None)

    order: Optional["Orders"] = Relationship(back_populates="order_details")
    variant: Optional["Variant"] = Relationship()

class Orders(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: Optional[int] = Field(default=None, foreign_key="customers.id")
    store_id: Optional[int] = Field(default=None, foreign_key="store.id")
    order_date: Optional[datetime] = Field(default=None)
    total_amount: Optional[float] = Field(default=None)

    customer: Optional["Customers"] = Relationship(back_populates="orders")
    store: Optional["Store"] = Relationship(back_populates="orders")
    order_details: List[OrderDetail] = Relationship(back_populates="order")

class Customers(SQLModel, table=True):
    __tablename__ = "customers"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None)
    sex: Optional[str] = Field(default=None)
    age: Optional[int] = Field(default=None)
    location: Optional[str] = Field(default=None)
    picture: Optional[str] = Field(default=None)
    embedding: Optional[str] = Field(default=None)
    username: Optional[str] = Field(default=None)
    password: Optional[str] = Field(default=None)

    orders: List[Orders] = Relationship(back_populates="customer")

class Product(SQLModel, table=True):
    __tablename__ = "product"

    id: Optional[int] = Field(default=None, primary_key=True)
    categories_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    name: Optional[str] = Field(default=None)
    descriptions: Optional[str] = Field(default=None)
    link_image: Optional[str] = Field(default=None)

    variants: List[Variant] = Relationship(back_populates="product")

class Categories(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name_cat: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    products: List[Product] = Relationship(back_populates="categories")
