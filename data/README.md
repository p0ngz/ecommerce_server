# 💎 Ecommerce Mockup Data - Complete Package

## 📦 What's Included

This package contains **comprehensive, production-ready mockup data** for a jewelry ecommerce application, including:

### Data Files (8 JSON files)
- ✅ **ecommerce.users.json** - 8 users (admin, seller, customers)
- ✅ **ecommerce.products.json** - 12 jewelry products with variants
- ✅ **ecommerce.coupon.json** - 6 discount coupons
- ✅ **ecommerce.orders.json** - 6 complete orders
- ✅ **ecommerce.cartlist.json** - 5 active shopping cart items
- ✅ **ecommerce.wishlist.json** - 8 wishlist entries
- ✅ **ecommerce.userCoupon.json** - 8 user-coupon relationships
- ✅ **ecommerce.blogs.json** - 10 blog posts

### Documentation Files
- 📄 **MOCKUP_DATA_SUMMARY.md** - Complete overview and statistics
- 📄 **DATA_RELATIONSHIPS.md** - Visual diagram of data relationships
- 📄 **TESTING_REFERENCE.md** - Quick reference for testing and API endpoints
- 📄 **README.md** - This file

### Generator Script
- 🐍 **generate_mockup.py** - Python script to regenerate all data

---

## 🎯 Key Features

### ✨ Realistic & Comprehensive
- **63 total documents** across 8 collections
- All data follows your Mongoose model schemas exactly
- Proper MongoDB extended JSON format ($oid, $date)
- Realistic values, prices, and user behaviors

### 🔗 Fully Interrelated
- All references use valid MongoDB ObjectIds
- Orders link to real users and products
- Coupons track usage across orders
- Cart and wishlist items reference existing products
- All relationships are consistent and validated

### 💼 Production-Ready
- Covers multiple business scenarios
- Different order statuses (placed, processing, shipped, delivered, cancelled)
- Active and expired coupons
- User activity patterns (active, inactive users)
- Product variants with stock management
- Calculated totals (subtotal, tax, shipping, discounts)

---

## 🚀 Quick Start

### 1. Import to MongoDB

```bash
# Navigate to data directory
cd "c:\Users\Windows 10\Desktop\Programming\Backend\expressJs\express_me\data"

# Import all collections
mongoimport --db ecommerce --collection users --file ecommerce.users.json --jsonArray
mongoimport --db ecommerce --collection products --file ecommerce.products.json --jsonArray
mongoimport --db ecommerce --collection coupons --file ecommerce.coupon.json --jsonArray
mongoimport --db ecommerce --collection orders --file ecommerce.orders.json --jsonArray
mongoimport --db ecommerce --collection cartlists --file ecommerce.cartlist.json --jsonArray
mongoimport --db ecommerce --collection wishlists --file ecommerce.wishlist.json --jsonArray
mongoimport --db ecommerce --collection usercoupons --file ecommerce.userCoupon.json --jsonArray
mongoimport --db ecommerce --collection blogs --file ecommerce.blogs.json --jsonArray
```

### 2. Verify Import

```bash
# Connect to MongoDB
mongosh ecommerce

# Check counts
db.users.countDocuments()      // Should return 8
db.products.countDocuments()   // Should return 12
db.orders.countDocuments()     // Should return 6
db.coupons.countDocuments()    // Should return 6
```

### 3. Test the Data

```javascript
// Find admin user
db.users.findOne({ role: "admin" })

// Find active coupons
db.coupons.find({ isActive: true })

// Find Sarah's orders
db.orders.find({ userID: ObjectId("676000000000000000000002") })

// Find bestselling products
db.products.find().sort({ sellingAmountTotal: -1 }).limit(5)
```

---

## 📊 Data Summary

| Collection | Count | Key Features |
|-----------|-------|--------------|
| **Users** | 8 | 1 admin, 1 seller, 6 customers (1 inactive) |
| **Products** | 12 | All jewelry types: earrings, necklaces, rings, bracelets |
| **Orders** | 6 | All statuses represented including cancelled |
| **Coupons** | 6 | Percentage & fixed discounts, active & expired |
| **CartList** | 5 | Active shopping carts for multiple users |
| **Wishlist** | 8 | User favorites across different users |
| **UserCoupons** | 8 | Claimed, used, and expired coupon states |
| **Blogs** | 10 | All blog types: jewelry, accessory, chronicle, news |

---

## 👥 Sample Users

```
ADMIN:
Username: Admin123
Email: admin@jewelryshop.com
Role: admin

MOST ACTIVE CUSTOMER:
Username: Sarah2024  
Email: sarah.johnson@email.com
Activity: 2 orders, 3 wishlists, 2 cart items, 2 coupons

SELLER:
Username: David2023
Email: david.wilson@email.com
Role: seller
```

---

## 💎 Sample Products

```
BESTSELLER:
PROD-006: Infinity Love Necklace
Price: $79.99
Sold: 247 units ⭐

PREMIUM:
PROD-003: Sapphire Engagement Ring
Price: $1,299.99 (20% off)
Rating: 5.0/5.0 ⭐⭐⭐⭐⭐

BEST DEAL:
PROD-008: Tennis Bracelet Deluxe
Price: $349.99 (25% OFF!) 🔥
```

---

## 🎫 Active Coupons

```
🎁 WELCOME10    - 10% off (min $50)
💰 FIXED50      - $50 off (min $300)
🎄 HOLIDAY15    - 15% off (min $75)
👑 VIP20        - 20% off (min $150)
```

---

## 🧪 Test Scenarios

### Scenario 1: New User Purchase
1. User registers → Michael99
2. Browses products → Sapphire Ring
3. Claims FIXED50 coupon
4. Adds to cart → Checkout
5. Order created → ORD-00002 (processing)

### Scenario 2: Returning Customer
1. Sarah logs in
2. Has items in cart (2 items)
3. Has claimed HOLIDAY15 coupon
4. Reviews wishlist (3 products)
5. Completes purchase

### Scenario 3: Order Tracking
- Track order ORD-00003
- Status: Shipped 🚚
- Expected delivery: Soon

---

## 🔄 Regenerate Data

To create fresh data with the same structure:

```bash
python generate_mockup.py
```

This will overwrite all JSON files with new, consistent mockup data.

---

## 📚 Documentation

- **MOCKUP_DATA_SUMMARY.md** - Detailed statistics and data breakdown
- **DATA_RELATIONSHIPS.md** - Visual diagrams showing how data connects
- **TESTING_REFERENCE.md** - API endpoints and test cases

---

## ✅ Data Quality Checklist

- [x] All required fields populated
- [x] Proper data types (numbers, strings, booleans, dates)
- [x] Valid enum values (sizes, types, statuses)
- [x] Consistent relationships across collections
- [x] Realistic prices and quantities
- [x] Proper date sequences
- [x] Valid MongoDB ObjectIds
- [x] Calculated fields correct
- [x] No orphaned references
- [x] Diverse user behaviors

---

## 🎨 Product Categories

### Earrings (3 products)
- Diamond Stud Earrings
- Emerald Drop Earrings
- Crystal Chandelier Earrings

### Necklaces (3 products)
- Pearl Necklace Classic
- Infinity Love Necklace
- Heart Locket Necklace

### Rings (3 products)
- Sapphire Engagement Ring
- Ruby Eternity Band
- Topaz Statement Ring

### Bracelets (3 products)
- Gold Chain Bracelet
- Tennis Bracelet Deluxe
- Charm Bracelet Silver

---

## 📈 Business Metrics (from mockup data)

- **Total Orders:** 6
- **Total Revenue:** ~$3,382.22
- **Average Order Value:** ~$563.70
- **Most Active User:** Sarah2024 (2 orders)
- **Bestselling Product:** Infinity Love Necklace (247 sold)
- **Conversion Rate:** 75% (6 orders / 8 users)
- **Active Coupons Used:** 50% (3 of 6 orders)

---

## 🛠️ Technical Details

### MongoDB Extended JSON Format
All data uses MongoDB's extended JSON format for proper type preservation:
- `{"$oid": "..."}` for ObjectIds
- `{"$date": "..."}` for dates
- Proper Boolean true/false (not strings)

### Consistency Rules
1. All product references in orders exist in products collection
2. All user references exist in users collection
3. All coupon references are valid
4. Order totals calculated correctly
5. Dates in chronological order
6. Stock levels are positive integers

---

## 💡 Tips for Use

### For Development
- Use this data to develop and test your application
- Import to local MongoDB for development
- All references are consistent - safe to test joins/populates

### For Testing
- Multiple user types for role-based testing
- Various order statuses for workflow testing  
- Active and expired coupons for validation testing
- Different product variants for cart testing

### For Demos
- Realistic data for client presentations
- Complete user journeys (cart → order → delivery)
- Diverse product catalog
- Professional blog content

---

## 📞 Support

If you need to regenerate or modify the data:

1. Edit `generate_mockup.py`
2. Run: `python generate_mockup.py`
3. Re-import to MongoDB

---

## 📝 License

This mockup data is generated for development and testing purposes.
All user emails and personal information are fictional.

---

**Generated:** December 21, 2025  
**Schema Version:** Compatible with current Mongoose models  
**Total Documents:** 63 across 8 collections  

**Status:** ✅ Production-Ready | 🔗 Fully Integrated | 📊 Comprehensive

---

## 🎉 You're All Set!

Your ecommerce application now has comprehensive, realistic mockup data that's ready to use. 

**Happy Coding! 💻✨**
