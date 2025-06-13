import uuid
from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column, String, Text

# --- Category ---
class CategoryBase(SQLModel):
    name_cat: str = Field(sa_column=Column('name_cat', String(255)))
    description: Optional[str] = Field(sa_column=Column('description', Text))

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    products: List["Product"] = Relationship(back_populates="category")

class CategoryPublic(CategoryBase):
    id: uuid.UUID

class CategoriesPublic(SQLModel):
    data: List[CategoryPublic]
    count: int

# --- Product ---
class ProductBase(SQLModel):
    name: str = Field(max_length=255)
    descriptions: Optional[str] = Field(sa_column=Column('descriptions', Text), default=None)
    link_image: Optional[str] = Field(default=None)

class ProductCreate(ProductBase):
    categories_id: uuid.UUID

class ProductUpdate(ProductBase):
    categories_id: Optional[uuid.UUID] = None

class Product(ProductBase, table=True):
    __tablename__ = "product"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    categories_id: uuid.UUID = Field(foreign_key="categories.id")
    variants: List["Variant"] = Relationship(back_populates="product")
    category: Category = Relationship(back_populates="products")

class ProductPublic(ProductBase):
    id: uuid.UUID
    categories_id: Optional[uuid.UUID]

class ProductsPublic(SQLModel):
    data: List[ProductPublic]
    count: int

# --- Variant ---
class VariantBase(SQLModel):
    beverage_option: Optional[str] = Field(sa_column=Column("Beverage_Option", String(100)), default=None)
    calories: Optional[float] = Field(default=None)
    dietary_fibre_g: Optional[float] = Field(default=None)
    sugars_g: Optional[float] = Field(default=None)
    protein_g: Optional[float] = Field(default=None)
    vitamin_a: Optional[str] = Field(sa_column=Column("vitamin_a", String(50)), default=None)
    vitamin_c: Optional[str] = Field(sa_column=Column("vitamin_c", String(50)), default=None)
    caffeine_mg: Optional[float] = Field(default=None)
    price: Optional[float] = Field(default=None)
    sales_rank: Optional[int] = Field(default=None)

class VariantCreate(VariantBase):
    product_id: Optional[uuid.UUID] = None

class VariantUpdate(VariantBase):
    product_id: Optional[uuid.UUID] = None

class Variant(VariantBase, table=True):
    __tablename__ = "variant"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    product_id: uuid.UUID = Field(foreign_key="product.id")
    product: Product = Relationship(back_populates="variants")
    order_details: List["OrderDetail"] = Relationship(back_populates="variant")

class VariantPublic(VariantBase):
    id: uuid.UUID
    product_id: Optional[uuid.UUID]

class VariantsPublic(SQLModel):
    data: List[VariantPublic]
    count: int

# --- Customer ---
class CustomerBase(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    sex: Optional[str] = Field(default=None, max_length=10)
    age: Optional[int] = None
    location: Optional[str] = Field(default=None, max_length=255)
    picture: Optional[str] = Field(default=None, max_length=255)
    embedding: Optional[str] = Field(sa_column=Column('embedding', Text), default=None)
    username: Optional[str] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class Customer(CustomerBase, table=True):
    __tablename__ = "customers"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    orders: List["Order"] = Relationship(back_populates="customer")

class CustomerPublic(CustomerBase):
    id: uuid.UUID

class CustomersPublic(SQLModel):
    data: List[CustomerPublic]
    count: int

# --- Store ---
class StoreBase(SQLModel):
    name_store: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    open_close: Optional[str] = Field(default=None, max_length=50)

class StoreCreate(StoreBase):
    pass

class StoreUpdate(StoreBase):
    pass

class Store(StoreBase, table=True):
    __tablename__ = "store"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    orders: List["Order"] = Relationship(back_populates="store")

class StorePublic(StoreBase):
    id: uuid.UUID

class StoresPublic(SQLModel):
    data: List[StorePublic]
    count: int

# --- Order ---
class OrderBase(SQLModel):
    order_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    total_amount: Optional[float] = Field(default=None)

class OrderCreate(OrderBase):
    customer_id: uuid.UUID
    store_id: uuid.UUID

class OrderUpdate(OrderBase):
    customer_id: Optional[uuid.UUID] = None
    store_id: Optional[uuid.UUID] = None

class Order(OrderBase, table=True):
    __tablename__ = "orders"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    customer_id: uuid.UUID = Field(foreign_key="customers.id")
    store_id: uuid.UUID = Field(foreign_key="store.id")
    customer: Customer = Relationship(back_populates="orders")
    store: Store = Relationship(back_populates="orders")  
    order_details: List["OrderDetail"] = Relationship(back_populates="order")

class OrderPublic(OrderBase):
    id: uuid.UUID
    customer_id: Optional[uuid.UUID]
    store_id: Optional[uuid.UUID]

class OrdersPublic(SQLModel):
    data: List[OrderPublic]
    count: int

# --- Order Detail ---
class OrderDetailBase(SQLModel):
    quantity: int = Field(default=1)
    rate: Optional[float] = Field(default=None)
    unit_price: Optional[float] = Field(default=None)

class OrderDetailCreate(OrderDetailBase):
    order_id: uuid.UUID
    variant_id: uuid.UUID

class OrderDetailUpdate(OrderDetailBase):
    order_id: Optional[uuid.UUID] = None
    variant_id: Optional[uuid.UUID] = None

class OrderDetail(OrderDetailBase, table=True):
    __tablename__ = "order_detail"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id")
    variant_id: uuid.UUID = Field(foreign_key="variant.id")
    order: Order = Relationship(back_populates="order_details")
    variant: Variant = Relationship(back_populates="order_details")

class OrderDetailPublic(OrderDetailBase):
    id: uuid.UUID
    order_id: uuid.UUID
    variant_id: uuid.UUID

class OrderDetailsPublic(SQLModel):
    data: List[OrderDetailPublic]
    count: int

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None