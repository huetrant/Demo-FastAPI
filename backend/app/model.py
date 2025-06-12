import uuid
from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel

# --- Category ---
class CategoryBase(SQLModel):
    name_cat: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=255)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    products: List["Product"] = Relationship(back_populates="category")

class CategoryPublic(CategoryBase):
    id: uuid.UUID

class CategoriesPublic(SQLModel):
    data: List[CategoryPublic]
    count: int

# --- Product ---
class ProductBase(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    descriptions: Optional[str] = Field(default=None, max_length=255)
    link_image: Optional[str] = Field(default=None, max_length=255)

class ProductCreate(ProductBase):
    categories_id: Optional[uuid.UUID] = None

class ProductUpdate(ProductBase):
    categories_id: Optional[uuid.UUID] = None

class Product(ProductBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    categories_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    variants: List["Variant"] = Relationship(back_populates="product")
    category: Optional[Category] = Relationship(back_populates="products")

class ProductPublic(ProductBase):
    id: uuid.UUID
    categories_id: Optional[uuid.UUID]

class ProductsPublic(SQLModel):
    data: List[ProductPublic]
    count: int

# --- Variant ---
class VariantBase(SQLModel):
    beverage_option: Optional[str] = Field(default=None, max_length=100)
    calories: Optional[float] = None
    dietary_fibre_g: Optional[float] = None
    sugars_g: Optional[float] = None
    protein_g: Optional[float] = None
    vitamin_a: Optional[str] = Field(default=None, max_length=50)
    vitamin_c: Optional[str] = Field(default=None, max_length=50)
    caffeine_mg: Optional[float] = None
    price: Optional[float] = None
    sales_rank: Optional[int] = None

class VariantCreate(VariantBase):
    product_id: Optional[uuid.UUID] = None

class VariantUpdate(VariantBase):
    product_id: Optional[uuid.UUID] = None

class Variant(VariantBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    product_id: Optional[uuid.UUID] = Field(default=None, foreign_key="product.id")
    product: Optional[Product] = Relationship(back_populates="variants")

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
    embedding: Optional[str] = Field(default=None, max_length=255)
    username: Optional[str] = Field(default=None, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=40)

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class Customer(CustomerBase, table=True):
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
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    orders: List["Order"] = Relationship(back_populates="store")

class StorePublic(StoreBase):
    id: uuid.UUID

class StoresPublic(SQLModel):
    data: List[StorePublic]
    count: int

# --- Order ---
class OrderBase(SQLModel):
    order_date: Optional[datetime] = None
    total_amount: Optional[float] = None

class OrderCreate(OrderBase):
    customer_id: Optional[uuid.UUID] = None
    store_id: Optional[uuid.UUID] = None

class OrderUpdate(OrderBase):
    customer_id: Optional[uuid.UUID] = None
    store_id: Optional[uuid.UUID] = None

class Order(OrderBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    customer_id: Optional[uuid.UUID] = Field(default=None, foreign_key="customer.id")
    store_id: Optional[uuid.UUID] = Field(default=None, foreign_key="store.id")
    customer: Optional[Customer] = Relationship(back_populates="orders")
    store: Optional[Store] = Relationship(back_populates="orders")
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
    quantity: Optional[int] = None
    rate: Optional[float] = None
    unit_price: Optional[float] = None

class OrderDetailCreate(OrderDetailBase):
    order_id: Optional[uuid.UUID] = None
    variant_id: Optional[uuid.UUID] = None

class OrderDetailUpdate(OrderDetailBase):
    order_id: Optional[uuid.UUID] = None
    variant_id: Optional[uuid.UUID] = None

class OrderDetail(OrderDetailBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: Optional[uuid.UUID] = Field(default=None, foreign_key="order.id")
    variant_id: Optional[uuid.UUID] = Field(default=None, foreign_key="variant.id")
    order: Optional[Order] = Relationship(back_populates="order_details")
    variant: Optional[Variant] = Relationship()

class OrderDetailPublic(OrderDetailBase):
    id: uuid.UUID
    order_id: Optional[uuid.UUID]
    variant_id: Optional[uuid.UUID]

class OrderDetailsPublic(SQLModel):
    data: List[OrderDetailPublic]
    count: int