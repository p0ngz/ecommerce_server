# Quick Test Data Reference

## User Accounts (for testing login/authentication)

```javascript
// ADMIN
{
  username: "Admin123",
  email: "admin@jewelryshop.com",
  password: "admin123", // (hashed in DB)
  role: "admin",
  _id: "676000000000000000000001"
}

// ACTIVE CUSTOMERS
{
  username: "Sarah2024",
  email: "sarah.johnson@email.com",
  password: "sarah123",
  role: "customer",
  _id: "676000000000000000000002"
  // Has: 2 orders (1 delivered, 1 cancelled), 3 wishlists, 2 cart items, 2 coupons
}

{
  username: "Michael99",
  email: "michael.brown@email.com",
  password: "michael123",
  role: "customer",
  _id: "676000000000000000000003"
  // Has: 1 order (processing), 1 coupon claimed
}

{
  username: "Emily2025",
  email: "emily.davis@email.com",
  password: "emily123",
  role: "customer",
  _id: "676000000000000000000004"
  // Has: 1 order (shipped), 1 cart item, 2 wishlists, 2 coupons
}

// SELLER
{
  username: "David2023",
  email: "david.wilson@email.com",
  password: "david123",
  role: "seller",
  _id: "676000000000000000000005"
}
```

## Popular Products (for testing)

```javascript
// Best Seller - Infinity Love Necklace
{
  productID: "PROD-006",
  productName: "Infinity Love Necklace",
  price: 79.99,
  discount: 0,
  sellingAmountTotal: 247, // Most sold!
  _id: "677000000000000000000006"
}

// Premium Item - Sapphire Engagement Ring
{
  productID: "PROD-003",
  productName: "Sapphire Engagement Ring",
  price: 1299.99,
  discount: 20,
  rating: 5.0,
  _id: "677000000000000000000003"
}

// Best Deal - Tennis Bracelet (25% off!)
{
  productID: "PROD-008",
  productName: "Tennis Bracelet Deluxe",
  price: 349.99,
  discount: 25, // Biggest discount!
  _id: "677000000000000000000008"
}
```

## Active Coupons (for testing checkout)

```javascript
// Welcome Discount
{
  code: "CPN-WELCOME10",
  discountType: "percentage",
  discountValue: 10,
  minimumPrice: 50,
  isActive: true,
  _id: "678000000000000000000001"
}

// Fixed Discount
{
  code: "CPN-FIXED5050",
  discountType: "fixed",
  discountValue: 50,
  minimumPrice: 300,
  isActive: true,
  _id: "678000000000000000000003"
}

// Holiday Sale
{
  code: "CPN-HOLIDAY1515",
  discountType: "percentage",
  discountValue: 15,
  minimumPrice: 75,
  isActive: true,
  _id: "678000000000000000000004"
}

// VIP Discount
{
  code: "CPN-VIP2020",
  discountType: "percentage",
  discountValue: 20,
  minimumPrice: 150,
  isActive: true,
  _id: "678000000000000000000005"
}
```

## Test Scenarios

### 1. Complete Purchase Flow
```
User: Sarah2024 (676000000000000000000002)
Cart: Already has 2 items
- PROD-005: Emerald Drop Earrings (1x) = $527.99
- PROD-012: Charm Bracelet Silver (1x) = $159.99
Subtotal: $687.98
Coupon: CPN-HOLIDAY1515 (15% off) = -$103.20
Shipping: $10.00
Tax: $47.18
Total: $641.96
```

### 2. New User Sign Up & First Purchase
```
1. Register new user
2. Browse products (filter by "necklace")
3. Add PROD-002 (Pearl Necklace) to cart
4. Claim WELCOME10 coupon
5. Checkout with coupon applied
6. Track order status
```

### 3. Admin Dashboard
```
User: Admin123 (676000000000000000000001)
Tasks:
- View all orders (6 total)
- Check pending orders (2: ORD-00002, ORD-00004)
- Create new coupon
- View product inventory
- Manage users
```

### 4. Wishlist to Cart Conversion
```
User: Emily2025 (676000000000000000000004)
Wishlists: 2 products
- PROD-002: Pearl Necklace Classic
- PROD-010: Heart Locket Necklace
Action: Move from wishlist to cart
```

### 5. Order Tracking
```
ORD-00001: Delivered ✓
ORD-00002: Processing ⏳
ORD-00003: Shipped 🚚
ORD-00004: Order Placed 📦
ORD-00005: Cancelled ❌
ORD-00006: Delivered ✓
```

## API Testing Endpoints

### Users
```
GET    /api/users          // Get all users (admin only)
GET    /api/users/:id      // Get user by ID
POST   /api/users/register // Register new user
POST   /api/users/login    // Login
PUT    /api/users/:id      // Update user profile
```

### Products
```
GET    /api/products                    // Get all products
GET    /api/products?typeProduct=ring   // Filter by type
GET    /api/products/:id                // Get product by ID
POST   /api/products                    // Create product (admin/seller)
PUT    /api/products/:id                // Update product
DELETE /api/products/:id                // Delete product
```

### Orders
```
GET    /api/orders           // Get all orders (admin)
GET    /api/orders/user/:id  // Get user's orders
GET    /api/orders/:id       // Get order by ID
POST   /api/orders           // Create new order
PUT    /api/orders/:id       // Update order status
```

### Cart
```
GET    /api/cart/:userId     // Get user's cart
POST   /api/cart             // Add to cart
PUT    /api/cart/:id         // Update cart item
DELETE /api/cart/:id         // Remove from cart
```

### Wishlist
```
GET    /api/wishlist/:userId // Get user's wishlist
POST   /api/wishlist         // Add to wishlist
DELETE /api/wishlist/:id     // Remove from wishlist
```

### Coupons
```
GET    /api/coupons          // Get all coupons
GET    /api/coupons/:code    // Validate coupon
POST   /api/coupons          // Create coupon (admin)
PUT    /api/coupons/:id      // Update coupon
```

### User Coupons
```
GET    /api/user-coupons/:userId  // Get user's coupons
POST   /api/user-coupons/claim    // Claim coupon
PUT    /api/user-coupons/use      // Use coupon in order
```

### Blogs
```
GET    /api/blogs                  // Get all blogs
GET    /api/blogs?blogType=jewelry // Filter by type
GET    /api/blogs/:id              // Get blog by ID
POST   /api/blogs                  // Create blog (admin)
PUT    /api/blogs/:id              // Update blog
DELETE /api/blogs/:id              // Soft delete blog
```

## Sample Request Bodies

### Create Order
```json
{
  "userID": "676000000000000000000002",
  "totalItem": 2,
  "detail": [
    {
      "product": "677000000000000000000001",
      "quantity": 1,
      "size": "M",
      "color": "White Gold",
      "price": 269.99
    }
  ],
  "deliverAddress": "456 Oak Avenue, Los Angeles, CA 90001",
  "subTotal": 269.99,
  "shippingPrice": 10,
  "taxPrice": 22.40,
  "totalPrice": 275.39,
  "coupon": "678000000000000000000001"
}
```

### Add to Cart
```json
{
  "userID": "676000000000000000000002",
  "productId": "677000000000000000000005",
  "quantity": 1,
  "size": "M",
  "color": "White Gold",
  "total": 527.99
}
```

### Claim Coupon
```json
{
  "userID": "676000000000000000000002",
  "couponID": "678000000000000000000004"
}
```

## Database Query Examples

### Find orders with specific status
```javascript
db.orders.find({ "status.current": "processing" })
```

### Find products with discount > 15%
```javascript
db.products.find({ discount: { $gt: 15 } })
```

### Find active coupons
```javascript
db.coupons.find({ isActive: true, validUntil: { $gt: new Date() } })
```

### Find user's claimed coupons
```javascript
db.usercoupons.find({ 
  userID: ObjectId("676000000000000000000002"),
  status: "claimed"
})
```

### Find popular products (high selling amount)
```javascript
db.products.find().sort({ sellingAmountTotal: -1 }).limit(5)
```

---

**Note:** All passwords in the actual database are hashed using bcrypt. The plain passwords shown here are for reference only.
