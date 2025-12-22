# Comprehensive Ecommerce Mockup Data - Summary

## Overview
This document describes the comprehensive mockup data generated for your jewelry ecommerce application. All data is interrelated and follows the Mongoose model schemas.

## Data Statistics

| Collection | Records | Description |
|-----------|---------|-------------|
| **Users** | 8 | 1 Admin, 1 Seller, 6 Customers |
| **Products** | 12 | All jewelry types with variants |
| **Orders** | 6 | Various order statuses |
| **Coupons** | 6 | Active & expired coupons |
| **Cart Items** | 5 | Current shopping carts |
| **Wishlists** | 8 | User wishlist entries |
| **UserCoupons** | 8 | Claimed, used, expired |
| **Blogs** | 10 | All blog categories |

## Data Relationships

### Users (8 total)
- **Admin123** (ID: 676000000000000000000001) - Admin role, created coupons
- **Sarah2024** (ID: 676000000000000000000002) - Active customer with orders
- **Michael99** (ID: 676000000000000000000003) - Customer with pending order
- **Emily2025** (ID: 676000000000000000000004) - Customer with shipped order
- **David2023** (ID: 676000000000000000000005) - Seller role
- **Jessica88** (ID: 676000000000000000000006) - Customer
- **Robert77** (ID: 676000000000000000000007) - Inactive customer
- **Amanda99** (ID: 676000000000000000000008) - Customer with cart items

### Products (12 total)
#### Earrings (3)
- **PROD-001**: Diamond Stud Earrings ($299.99, 10% discount)
- **PROD-005**: Emerald Drop Earrings ($599.99, 12% discount)
- **PROD-009**: Crystal Chandelier Earrings ($129.99, 8% discount)

#### Necklaces (3)
- **PROD-002**: Pearl Necklace Classic ($449.99, 15% discount)
- **PROD-006**: Infinity Love Necklace ($79.99, no discount)
- **PROD-010**: Heart Locket Necklace ($119.99, 10% discount)

#### Rings (3)
- **PROD-003**: Sapphire Engagement Ring ($1,299.99, 20% discount)
- **PROD-007**: Ruby Eternity Band ($899.99, 18% discount)
- **PROD-011**: Topaz Statement Ring ($249.99, 15% discount)

#### Bracelets (3)
- **PROD-004**: Gold Chain Bracelet ($189.99, 5% discount)
- **PROD-008**: Tennis Bracelet Deluxe ($349.99, 25% discount)
- **PROD-012**: Charm Bracelet Silver ($159.99, no discount)

### Coupons (6 total)
- **CPN-001 (WELCOME10)**: 10% off, active, used 23 times
- **CPN-002 (SUMMER2525)**: 25% off, expired (summer sale)
- **CPN-003 (FIXED5050)**: $50 fixed discount, active
- **CPN-004 (HOLIDAY1515)**: 15% off, active (holiday season)
- **CPN-005 (VIP2020)**: 20% off, active (VIP members)
- **CPN-006 (FLASH3030)**: 30% off, expired (flash sale)

### Orders (6 total)
1. **ORD-00001**: Sarah2024, 2 items, delivered, used WELCOME coupon
2. **ORD-00002**: Michael99, 1 item (sapphire ring), processing
3. **ORD-00003**: Emily2025, 2 items, shipped, used HOLIDAY coupon
4. **ORD-00004**: Jessica88, 1 item (pearl necklace), order placed
5. **ORD-00005**: Sarah2024, 2 items, CANCELLED
6. **ORD-00006**: Amanda99, 1 item (ruby ring), delivered, used VIP coupon

### Cart Items (5 active)
- Sarah2024: 2 items in cart
- Emily2025: 1 item in cart
- Jessica88: 1 item in cart
- Amanda99: 1 item in cart

### Wishlists (8 entries)
- Sarah2024: 3 products wishlisted
- Emily2025: 2 products wishlisted
- Jessica88: 1 product wishlisted
- Amanda99: 2 products wishlisted

### User-Coupon Relationships (8 total)
**Used Coupons (3):**
- Sarah2024 used WELCOME10 on ORD-00001
- Emily2025 used HOLIDAY15 on ORD-00003
- Amanda99 used VIP20 on ORD-00006

**Claimed (not yet used) (4):**
- Sarah2024: HOLIDAY15
- Michael99: FIXED50
- Emily2025: VIP20
- Amanda99: WELCOME10

**Expired (1):**
- Jessica88: FLASH30 (claimed but expired before use)

### Blogs (10 posts)
**Jewelry (3 posts):**
- How to Properly Care for Your Fine Jewelry
- The Ultimate Guide to Buying an Engagement Ring
- 2025 Bridal Jewelry Trends You'll Love

**Accessory (2 posts):**
- Top 10 Spring Jewelry Trends for 2024
- Master the Art of Jewelry Layering

**Bling Chronicle (2 posts):**
- The Fascinating World of Gemstone Symbolism
- Pearls Through the Ages: A Historical Journey

**News (3 posts):**
- Introducing Our Autumn Collection 2024
- Perfect Jewelry Gifts for Everyone on Your List
- Our Commitment to Sustainable and Ethical Jewelry

## Key Features of the Mockup Data

### 1. **Realistic Product Variants**
Each product has multiple color and size variants with individual stock levels and selling amounts. This mirrors real-world inventory management.

### 2. **Order Status Progression**
Orders show different stages:
- Order Placed (initial state)
- Processing (being prepared)
- Shipped (in transit)
- Delivered (completed)
- Cancelled (one example)

### 3. **Coupon Lifecycle**
Coupons demonstrate:
- Active coupons available for use
- Expired coupons (date-based)
- Usage limits and counts
- Both percentage and fixed discount types

### 4. **User Behavior Patterns**
- Active users with multiple orders
- Users with items in cart
- Users with wishlisted products
- Inactive user (Robert77)

### 5. **Proper References**
All relationships use MongoDB ObjectIds:
- Orders reference Users and Products
- CartList references Users and Products
- Wishlists reference Users and Products
- UserCoupons reference Users, Coupons, and Orders
- Coupons reference creator (Admin user)

### 6. **Calculated Fields**
- Order totals include subtotal, shipping, tax, discounts
- Products track total selling amounts
- Proper price calculations with discounts applied

## Usage Notes

### To Import to MongoDB:
```bash
mongoimport --db ecommerce --collection users --file ecommerce.users.json --jsonArray
mongoimport --db ecommerce --collection products --file ecommerce.products.json --jsonArray
mongoimport --db ecommerce --collection coupons --file ecommerce.coupon.json --jsonArray
mongoimport --db ecommerce --collection orders --file ecommerce.orders.json --jsonArray
mongoimport --db ecommerce --collection cartlists --file ecommerce.cartlist.json --jsonArray
mongoimport --db ecommerce --collection wishlists --file ecommerce.wishlist.json --jsonArray
mongoimport --db ecommerce --collection usercoupons --file ecommerce.userCoupon.json --jsonArray
mongoimport --db ecommerce --collection blogs --file ecommerce.blogs.json --jsonArray
```

### Testing Scenarios

**Scenario 1: New Order Creation**
- User: Emily2025 has items in cart
- Can create order using HOLIDAY15 coupon she has claimed

**Scenario 2: Coupon Usage**
- Michael99 has FIXED50 coupon claimed
- Can apply to his next order (minimum $300)

**Scenario 3: Product Search**
- Filter by typeProduct: "ring" returns 3 products
- Filter by discount > 15: returns 4 products

**Scenario 4: User Activity**
- Sarah2024 is most active: 2 orders, 3 wishlists, 2 cart items, 2 coupons

## Data Quality Features

✅ All required fields populated according to models
✅ Proper data types (numbers, strings, booleans, dates)
✅ Realistic values and ranges
✅ Consistent relationships across collections
✅ Valid enum values (sizes, product types, order statuses, etc.)
✅ Proper MongoDB extended JSON format ($oid, $date)
✅ Diversity in user profiles and purchase behaviors
✅ Variety in product offerings and pricing

## Regenerating Data

To regenerate all mockup data, simply run:
```bash
python data/generate_mockup.py
```

This will overwrite all ecommerce JSON files with fresh, consistent data.

---

**Generated on:** December 21, 2025
**Data Schema Version:** Based on current Mongoose models
**Total Records:** 63 documents across 8 collections
