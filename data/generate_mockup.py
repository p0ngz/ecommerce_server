import json
import os

# Get the directory where this script is located
base_path = os.path.dirname(os.path.abspath(__file__))

print("Generating comprehensive mockup data for ecommerce...")
print(f"Base path: {base_path}\n")

# ================== USERS DATA ==================
users_data = [
    {
        "_id": {"$oid": "676000000000000000000001"},
        "username": "Admin123",
        "email": "admin@jewelryshop.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "admin",
        "isActive": True,
        "createdAt": {"$date": "2024-01-15T08:00:00.000Z"},
        "information": {
            "userImage": "/uploads/users/admin_profile.jpg",
            "firstName": "John",
            "lastName": "Anderson",
            "address": "123 Business Street, New York, NY 10001",
            "gender": "male",
            "birthDate": {"$date": "1985-05-20T00:00:00.000Z"},
            "phone": "555-0101"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000002"},
        "username": "Sarah2024",
        "email": "sarah.johnson@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": True,
        "createdAt": {"$date": "2024-03-10T10:30:00.000Z"},
        "information": {
            "userImage": "/uploads/users/sarah_profile.jpg",
            "firstName": "Sarah",
            "lastName": "Johnson",
            "address": "456 Oak Avenue, Los Angeles, CA 90001",
            "gender": "female",
            "birthDate": {"$date": "1992-08-15T00:00:00.000Z"},
            "phone": "555-0102"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000003"},
        "username": "Michael99",
        "email": "michael.brown@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": True,
        "createdAt": {"$date": "2024-05-22T14:15:00.000Z"},
        "information": {
            "userImage": "/uploads/users/michael_profile.jpg",
            "firstName": "Michael",
            "lastName": "Brown",
            "address": "789 Pine Road, Chicago, IL 60601",
            "gender": "male",
            "birthDate": {"$date": "1988-11-30T00:00:00.000Z"},
            "phone": "555-0103"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000004"},
        "username": "Emily2025",
        "email": "emily.davis@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": True,
        "createdAt": {"$date": "2024-07-08T09:45:00.000Z"},
        "information": {
            "userImage": "/uploads/users/emily_profile.jpg",
            "firstName": "Emily",
            "lastName": "Davis",
            "address": "321 Maple Drive, Houston, TX 77001",
            "gender": "female",
            "birthDate": {"$date": "1995-03-12T00:00:00.000Z"},
            "phone": "555-0104"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000005"},
        "username": "David2023",
        "email": "david.wilson@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "seller",
        "isActive": True,
        "createdAt": {"$date": "2024-02-18T11:20:00.000Z"},
        "information": {
            "userImage": "/uploads/users/david_profile.jpg",
            "firstName": "David",
            "lastName": "Wilson",
            "address": "654 Elm Street, Miami, FL 33101",
            "gender": "male",
            "birthDate": {"$date": "1990-06-25T00:00:00.000Z"},
            "phone": "555-0105"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000006"},
        "username": "Jessica88",
        "email": "jessica.martinez@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": True,
        "createdAt": {"$date": "2024-09-14T16:00:00.000Z"},
        "information": {
            "userImage": "/uploads/users/jessica_profile.jpg",
            "firstName": "Jessica",
            "lastName": "Martinez",
            "address": "987 Cedar Lane, Phoenix, AZ 85001",
            "gender": "female",
            "birthDate": {"$date": "1993-09-18T00:00:00.000Z"},
            "phone": "555-0106"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000007"},
        "username": "Robert77",
        "email": "robert.taylor@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": False,
        "createdAt": {"$date": "2024-04-05T13:30:00.000Z"},
        "information": {
            "firstName": "Robert",
            "lastName": "Taylor",
            "gender": "male"
        },
        "__v": 0
    },
    {
        "_id": {"$oid": "676000000000000000000008"},
        "username": "Amanda99",
        "email": "amanda.lee@email.com",
        "password": "$2b$10$rQY8jK7zHJxZ5nVZ5nVZ5O3LfZ5nVZ5nVZ5nVZ5nVZ5nVZ5nVZ5",
        "role": "customer",
        "isActive": True,
        "createdAt": {"$date": "2024-11-20T12:00:00.000Z"},
        "information": {
            "userImage": "/uploads/users/amanda_profile.jpg",
            "firstName": "Amanda",
            "lastName": "Lee",
            "address": "147 Birch Avenue, Seattle, WA 98101",
            "gender": "female",
            "birthDate": {"$date": "1997-01-08T00:00:00.000Z"},
            "phone": "555-0108"
        },
        "__v": 0
    }
]

# Write users data
with open(os.path.join(base_path, "ecommerce.users.json"), "w", encoding="utf-8") as f:
    json.dump(users_data, f, indent=2)
print("✓ Users data created (8 users)")

# ================== PRODUCTS DATA ==================
products_data = [
    {
        "_id": {"$oid": "677000000000000000000001"},
        "productID": "PROD-001",
        "productName": "Diamond Stud Earrings",
        "productImg": "/uploads/products/diamond_stud_earrings.jpg",
        "typeProduct": "earring",
        "rating": 4.8,
        "description": "Elegant diamond stud earrings featuring brilliant-cut diamonds set in 14k white gold. Perfect for everyday wear or special occasions.",
        "inStock": 45,
        "discount": 10,
        "price": 299.99,
        "variants": [
            {"color": "white gold", "size": "S", "inStock": 15, "sellingAmount": 23},
            {"color": "white gold", "size": "M", "inStock": 20, "sellingAmount": 18},
            {"color": "rose gold", "size": "S", "inStock": 10, "sellingAmount": 12}
        ],
        "sellingAmountTotal": 53,
        "createdAt": {"$date": "2024-01-20T10:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000002"},
        "productID": "PROD-002",
        "productName": "Pearl Necklace Classic",
        "productImg": "/uploads/products/pearl_necklace.jpg",
        "typeProduct": "necklace",
        "rating": 4.9,
        "description": "Timeless freshwater pearl necklace with 8-9mm pearls, 18-inch length with sterling silver clasp. A classic piece for any jewelry collection.",
        "inStock": 32,
        "discount": 15,
        "price": 449.99,
        "variants": [
            {"color": "white", "size": "M", "inStock": 12, "sellingAmount": 34},
            {"color": "cream", "size": "M", "inStock": 10, "sellingAmount": 28},
            {"color": "pink", "size": "L", "inStock": 10, "sellingAmount": 19}
        ],
        "sellingAmountTotal": 81,
        "createdAt": {"$date": "2024-02-05T11:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000003"},
        "productID": "PROD-003",
        "productName": "Sapphire Engagement Ring",
        "productImg": "/uploads/products/sapphire_ring.jpg",
        "typeProduct": "ring",
        "rating": 5.0,
        "description": "Stunning blue sapphire ring surrounded by diamond halo, set in platinum band. Perfect for engagements or special celebrations.",
        "inStock": 18,
        "discount": 20,
        "price": 1299.99,
        "variants": [
            {"color": "platinum", "size": "S", "inStock": 5, "sellingAmount": 8},
            {"color": "platinum", "size": "M", "inStock": 8, "sellingAmount": 12},
            {"color": "white gold", "size": "M", "inStock": 5, "sellingAmount": 6}
        ],
        "sellingAmountTotal": 26,
        "createdAt": {"$date": "2024-03-15T09:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000004"},
        "productID": "PROD-004",
        "productName": "Gold Chain Bracelet",
        "productImg": "/uploads/products/gold_bracelet.jpg",
        "typeProduct": "bracelet",
        "rating": 4.6,
        "description": "Elegant 18k yellow gold chain bracelet with lobster clasp. Versatile design that pairs well with any outfit.",
        "inStock": 55,
        "discount": 5,
        "price": 189.99,
        "variants": [
            {"color": "yellow gold", "size": "S", "inStock": 15, "sellingAmount": 45},
            {"color": "yellow gold", "size": "M", "inStock": 25, "sellingAmount": 67},
            {"color": "yellow gold", "size": "L", "inStock": 15, "sellingAmount": 32}
        ],
        "sellingAmountTotal": 144,
        "createdAt": {"$date": "2024-04-10T14:20:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000005"},
        "productID": "PROD-005",
        "productName": "Emerald Drop Earrings",
        "productImg": "/uploads/products/emerald_earrings.jpg",
        "typeProduct": "earring",
        "rating": 4.7,
        "description": "Beautiful emerald drop earrings with diamond accents in 14k white gold. Perfect for evening wear.",
        "inStock": 28,
        "discount": 12,
        "price": 599.99,
        "variants": [
            {"color": "white gold", "size": "M", "inStock": 15, "sellingAmount": 21},
            {"color": "yellow gold", "size": "M", "inStock": 13, "sellingAmount": 15}
        ],
        "sellingAmountTotal": 36,
        "createdAt": {"$date": "2024-05-18T16:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000006"},
        "productID": "PROD-006",
        "productName": "Infinity Love Necklace",
        "productImg": "/uploads/products/infinity_necklace.jpg",
        "typeProduct": "necklace",
        "rating": 4.9,
        "description": "Sterling silver infinity symbol necklace with cubic zirconia stones. Symbolizes eternal love and friendship.",
        "inStock": 67,
        "discount": 0,
        "price": 79.99,
        "variants": [
            {"color": "silver", "size": "S", "inStock": 25, "sellingAmount": 89},
            {"color": "silver", "size": "M", "inStock": 30, "sellingAmount": 102},
            {"color": "rose gold", "size": "S", "inStock": 12, "sellingAmount": 56}
        ],
        "sellingAmountTotal": 247,
        "createdAt": {"$date": "2024-06-22T08:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000007"},
        "productID": "PROD-007",
        "productName": "Ruby Eternity Band",
        "productImg": "/uploads/products/ruby_band.jpg",
        "typeProduct": "ring",
        "rating": 4.8,
        "description": "Stunning ruby eternity band with continuous gemstones around the band. Set in 14k white gold.",
        "inStock": 22,
        "discount": 18,
        "price": 899.99,
        "variants": [
            {"color": "white gold", "size": "S", "inStock": 7, "sellingAmount": 11},
            {"color": "white gold", "size": "M", "inStock": 10, "sellingAmount": 14},
            {"color": "white gold", "size": "L", "inStock": 5, "sellingAmount": 7}
        ],
        "sellingAmountTotal": 32,
        "createdAt": {"$date": "2024-07-30T12:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000008"},
        "productID": "PROD-008",
        "productName": "Tennis Bracelet Deluxe",
        "productImg": "/uploads/products/tennis_bracelet.jpg",
        "typeProduct": "bracelet",
        "rating": 5.0,
        "description": "Classic tennis bracelet featuring 4mm cubic zirconia stones in sterling silver setting. Timeless elegance.",
        "inStock": 41,
        "discount": 25,
        "price": 349.99,
        "variants": [
            {"color": "silver", "size": "S", "inStock": 12, "sellingAmount": 28},
            {"color": "silver", "size": "M", "inStock": 18, "sellingAmount": 41},
            {"color": "silver", "size": "L", "inStock": 11, "sellingAmount": 19}
        ],
        "sellingAmountTotal": 88,
        "createdAt": {"$date": "2024-08-12T10:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000009"},
        "productID": "PROD-009",
        "productName": "Crystal Chandelier Earrings",
        "productImg": "/uploads/products/chandelier_earrings.jpg",
        "typeProduct": "earring",
        "rating": 4.5,
        "description": "Glamorous crystal chandelier earrings perfect for weddings and formal events. Rhodium plated for lasting shine.",
        "inStock": 35,
        "discount": 8,
        "price": 129.99,
        "variants": [
            {"color": "clear crystal", "size": "L", "inStock": 20, "sellingAmount": 52},
            {"color": "blue crystal", "size": "L", "inStock": 15, "sellingAmount": 31}
        ],
        "sellingAmountTotal": 83,
        "createdAt": {"$date": "2024-09-25T15:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000010"},
        "productID": "PROD-010",
        "productName": "Heart Locket Necklace",
        "productImg": "/uploads/products/heart_locket.jpg",
        "typeProduct": "necklace",
        "rating": 4.7,
        "description": "Vintage-style heart locket necklace in rose gold plating. Opens to hold two photos, includes 20-inch chain.",
        "inStock": 48,
        "discount": 10,
        "price": 119.99,
        "variants": [
            {"color": "rose gold", "size": "M", "inStock": 25, "sellingAmount": 76},
            {"color": "silver", "size": "M", "inStock": 15, "sellingAmount": 43},
            {"color": "gold", "size": "L", "inStock": 8, "sellingAmount": 22}
        ],
        "sellingAmountTotal": 141,
        "createdAt": {"$date": "2024-10-08T11:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000011"},
        "productID": "PROD-011",
        "productName": "Topaz Statement Ring",
        "productImg": "/uploads/products/topaz_ring.jpg",
        "typeProduct": "ring",
        "rating": 4.6,
        "description": "Bold blue topaz cocktail ring with halo setting in sterling silver. Makes a stunning statement piece.",
        "inStock": 16,
        "discount": 15,
        "price": 249.99,
        "variants": [
            {"color": "silver", "size": "M", "inStock": 8, "sellingAmount": 17},
            {"color": "silver", "size": "L", "inStock": 8, "sellingAmount": 13}
        ],
        "sellingAmountTotal": 30,
        "createdAt": {"$date": "2024-11-15T13:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "677000000000000000000012"},
        "productID": "PROD-012",
        "productName": "Charm Bracelet Silver",
        "productImg": "/uploads/products/charm_bracelet.jpg",
        "typeProduct": "bracelet",
        "rating": 4.8,
        "description": "Sterling silver charm bracelet with 5 starter charms. Add your own charms to create a personalized piece.",
        "inStock": 58,
        "discount": 0,
        "price": 159.99,
        "variants": [
            {"color": "silver", "size": "S", "inStock": 18, "sellingAmount": 38},
            {"color": "silver", "size": "M", "inStock": 25, "sellingAmount": 59},
            {"color": "silver", "size": "L", "inStock": 15, "sellingAmount": 26}
        ],
        "sellingAmountTotal": 123,
        "createdAt": {"$date": "2024-12-01T09:20:00.000Z"},
        "__v": 0
    }
]

# Write products data
with open(os.path.join(base_path, "ecommerce.products.json"), "w", encoding="utf-8") as f:
    json.dump(products_data, f, indent=2)
print("✓ Products data created (12 jewelry products)")

# ================== COUPONS DATA ==================
coupons_data = [
    {
        "_id": {"$oid": "678000000000000000000001"},
        "couponID": "CPN-001",
        "couponName": "WELCOME",
        "code": "CPN-WELCOME10",
        "discountType": "percentage",
        "discountValue": 10,
        "description": "Welcome discount for new customers",
        "minimumPrice": 50,
        "maximumPrice": None,
        "minDiscountAmount": 5,
        "maxDiscountAmount": 50,
        "usageLimit": 100,
        "usageCount": 23,
        "validFrom": {"$date": "2024-01-01T00:00:00.000Z"},
        "validUntil": {"$date": "2025-12-31T23:59:59.000Z"},
        "isActive": True,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-01-01T08:00:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    },
    {
        "_id": {"$oid": "678000000000000000000002"},
        "couponID": "CPN-002",
        "couponName": "SUMMER25",
        "code": "CPN-SUMMER2525",
        "discountType": "percentage",
        "discountValue": 25,
        "description": "Summer sale discount - 25% off",
        "minimumPrice": 100,
        "maximumPrice": None,
        "minDiscountAmount": 10,
        "maxDiscountAmount": 200,
        "usageLimit": 50,
        "usageCount": 38,
        "validFrom": {"$date": "2024-06-01T00:00:00.000Z"},
        "validUntil": {"$date": "2024-08-31T23:59:59.000Z"},
        "isActive": False,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-05-15T10:00:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    },
    {
        "_id": {"$oid": "678000000000000000000003"},
        "couponID": "CPN-003",
        "couponName": "FIXED50",
        "code": "CPN-FIXED5050",
        "discountType": "fixed",
        "discountValue": 50,
        "description": "$50 off on orders above $300",
        "minimumPrice": 300,
        "maximumPrice": None,
        "minDiscountAmount": 0,
        "maxDiscountAmount": None,
        "usageLimit": 30,
        "usageCount": 15,
        "validFrom": {"$date": "2024-01-01T00:00:00.000Z"},
        "validUntil": {"$date": "2025-12-31T23:59:59.000Z"},
        "isActive": True,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-01-10T14:30:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    },
    {
        "_id": {"$oid": "678000000000000000000004"},
        "couponID": "CPN-004",
        "couponName": "HOLIDAY15",
        "code": "CPN-HOLIDAY1515",
        "discountType": "percentage",
        "discountValue": 15,
        "description": "Holiday season special - 15% off",
        "minimumPrice": 75,
        "maximumPrice": None,
        "minDiscountAmount": 10,
        "maxDiscountAmount": 100,
        "usageLimit": 80,
        "usageCount": 42,
        "validFrom": {"$date": "2024-11-01T00:00:00.000Z"},
        "validUntil": {"$date": "2025-01-15T23:59:59.000Z"},
        "isActive": True,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-10-20T09:00:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    },
    {
        "_id": {"$oid": "678000000000000000000005"},
        "couponID": "CPN-005",
        "couponName": "VIP20",
        "code": "CPN-VIP2020",
        "discountType": "percentage",
        "discountValue": 20,
        "description": "VIP members exclusive discount",
        "minimumPrice": 150,
        "maximumPrice": None,
        "minDiscountAmount": 20,
        "maxDiscountAmount": 300,
        "usageLimit": 20,
        "usageCount": 8,
        "validFrom": {"$date": "2024-01-01T00:00:00.000Z"},
        "validUntil": {"$date": "2025-12-31T23:59:59.000Z"},
        "isActive": True,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-02-01T11:00:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    },
    {
        "_id": {"$oid": "678000000000000000000006"},
        "couponID": "CPN-006",
        "couponName": "FLASH30",
        "code": "CPN-FLASH3030",
        "discountType": "percentage",
        "discountValue": 30,
        "description": "Flash sale - 30% off (expired)",
        "minimumPrice": 80,
        "maximumPrice": None,
        "minDiscountAmount": 15,
        "maxDiscountAmount": 150,
        "usageLimit": 25,
        "usageCount": 25,
        "validFrom": {"$date": "2024-09-01T00:00:00.000Z"},
        "validUntil": {"$date": "2024-09-07T23:59:59.000Z"},
        "isActive": False,
        "createdBy": {
            "userId": {"$oid": "676000000000000000000001"},
            "createdAt": {"$date": "2024-08-25T15:00:00.000Z"}
        },
        "isDeleted": False,
        "__v": 0
    }
]

# Write coupons data
with open(os.path.join(base_path, "ecommerce.coupon.json"), "w", encoding="utf-8") as f:
    json.dump(coupons_data, f, indent=2)
print("✓ Coupons data created (6 coupons)")

# ================== ORDERS DATA ==================
orders_data = [
    {
        "_id": {"$oid": "679000000000000000000001"},
        "orderID": "ORD-00001",
        "userID": {"$oid": "676000000000000000000002"},
        "trackingNumber": "TRK1234567",
        "totalItem": 2,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000001"},
                "product": {"$oid": "677000000000000000000001"},
                "quantity": 1,
                "size": "M",
                "color": "white gold",
                "price": 269.99
            },
            {
                "_id": {"$oid": "679100000000000000000002"},
                "product": {"$oid": "677000000000000000000006"},
                "quantity": 2,
                "size": "S",
                "color": "silver",
                "price": 159.98
            }
        ],
        "deliverAddress": "456 Oak Avenue, Los Angeles, CA 90001",
        "status": {
            "pass": ["orderPlaced", "processing", "shipped", "delivered"],
            "current": ["delivered"]
        },
        "cancel": False,
        "subTotal": 429.97,
        "shippingPrice": 10,
        "taxPrice": 34.40,
        "discount": {
            "percent": 10,
            "amount": 42.99
        },
        "totalPrice": 431.38,
        "coupon": {"$oid": "678000000000000000000001"},
        "createdAt": {"$date": "2024-11-05T14:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "679000000000000000000002"},
        "orderID": "ORD-00002",
        "userID": {"$oid": "676000000000000000000003"},
        "trackingNumber": "TRK2345678",
        "totalItem": 1,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000003"},
                "product": {"$oid": "677000000000000000000003"},
                "quantity": 1,
                "size": "M",
                "color": "platinum",
                "price": 1039.99
            }
        ],
        "deliverAddress": "789 Pine Road, Chicago, IL 60601",
        "status": {
            "pass": ["orderPlaced", "processing"],
            "current": ["processing"]
        },
        "cancel": False,
        "subTotal": 1039.99,
        "shippingPrice": 0,
        "taxPrice": 83.20,
        "discount": {
            "percent": 20,
            "amount": 259.99
        },
        "totalPrice": 863.20,
        "coupon": None,
        "createdAt": {"$date": "2024-12-10T09:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "679000000000000000000003"},
        "orderID": "ORD-00003",
        "userID": {"$oid": "676000000000000000000004"},
        "trackingNumber": "TRK3456789",
        "totalItem": 3,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000004"},
                "product": {"$oid": "677000000000000000000004"},
                "quantity": 2,
                "size": "M",
                "color": "yellow gold",
                "price": 360.98
            },
            {
                "_id": {"$oid": "679100000000000000000005"},
                "product": {"$oid": "677000000000000000000009"},
                "quantity": 1,
                "size": "L",
                "color": "clear crystal",
                "price": 119.59
            }
        ],
        "deliverAddress": "321 Maple Drive, Houston, TX 77001",
        "status": {
            "pass": ["orderPlaced", "processing", "shipped"],
            "current": ["shipped"]
        },
        "cancel": False,
        "subTotal": 480.57,
        "shippingPrice": 8.99,
        "taxPrice": 38.45,
        "discount": {
            "percent": 15,
            "amount": 72.08
        },
        "totalPrice": 455.93,
        "coupon": {"$oid": "678000000000000000000004"},
        "createdAt": {"$date": "2024-12-15T16:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "679000000000000000000004"},
        "orderID": "ORD-00004",
        "userID": {"$oid": "676000000000000000000006"},
        "trackingNumber": "TRK4567890",
        "totalItem": 1,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000006"},
                "product": {"$oid": "677000000000000000000002"},
                "quantity": 1,
                "size": "M",
                "color": "white",
                "price": 382.49
            }
        ],
        "deliverAddress": "987 Cedar Lane, Phoenix, AZ 85001",
        "status": {
            "pass": ["orderPlaced"],
            "current": ["orderPlaced"]
        },
        "cancel": False,
        "subTotal": 382.49,
        "shippingPrice": 10,
        "taxPrice": 30.60,
        "discount": {
            "percent": 15,
            "amount": 67.31
        },
        "totalPrice": 355.78,
        "coupon": None,
        "createdAt": {"$date": "2024-12-18T11:20:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "679000000000000000000005"},
        "orderID": "ORD-00005",
        "userID": {"$oid": "676000000000000000000002"},
        "trackingNumber": "TRK5678901",
        "totalItem": 2,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000007"},
                "product": {"$oid": "677000000000000000000008"},
                "quantity": 1,
                "size": "M",
                "color": "silver",
                "price": 262.49
            },
            {
                "_id": {"$oid": "679100000000000000000008"},
                "product": {"$oid": "677000000000000000000010"},
                "quantity": 1,
                "size": "M",
                "color": "rose gold",
                "price": 107.99
            }
        ],
        "deliverAddress": "456 Oak Avenue, Los Angeles, CA 90001",
        "status": {
            "pass": ["orderPlaced"],
            "current": ["orderPlaced"]
        },
        "cancel": True,
        "subTotal": 370.48,
        "shippingPrice": 10,
        "taxPrice": 29.64,
        "discount": {
            "percent": 0,
            "amount": 0
        },
        "totalPrice": 410.12,
        "coupon": None,
        "createdAt": {"$date": "2024-12-19T13:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "679000000000000000000006"},
        "orderID": "ORD-00006",
        "userID": {"$oid": "676000000000000000000008"},
        "trackingNumber": "TRK6789012",
        "totalItem": 1,
        "detail": [
            {
                "_id": {"$oid": "679100000000000000000009"},
                "product": {"$oid": "677000000000000000000007"},
                "quantity": 1,
                "size": "M",
                "color": "white gold",
                "price": 737.99
            }
        ],
        "deliverAddress": "147 Birch Avenue, Seattle, WA 98101",
        "status": {
            "pass": ["orderPlaced", "processing", "shipped", "delivered"],
            "current": ["delivered"]
        },
        "cancel": False,
        "subTotal": 737.99,
        "shippingPrice": 0,
        "taxPrice": 59.04,
        "discount": {
            "percent": 18,
            "amount": 162.24
        },
        "totalPrice": 634.79,
        "coupon": {"$oid": "678000000000000000000005"},
        "createdAt": {"$date": "2024-12-12T10:30:00.000Z"},
        "__v": 0
    }
]

# Write orders data
with open(os.path.join(base_path, "ecommerce.orders.json"), "w", encoding="utf-8") as f:
    json.dump(orders_data, f, indent=2)
print("✓ Orders data created (6 orders)")

# ================== CARTLIST DATA ==================
cartlist_data = [
    {
        "_id": {"$oid": "680000000000000000000001"},
        "userID": {"$oid": "676000000000000000000002"},
        "productId": {"$oid": "677000000000000000000005"},
        "quantity": 1,
        "size": "M",
        "color": "white gold",
        "total": 527.99,
        "createdAt": {"$date": "2024-12-20T10:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "680000000000000000000002"},
        "userID": {"$oid": "676000000000000000000002"},
        "productId": {"$oid": "677000000000000000000012"},
        "quantity": 1,
        "size": "M",
        "color": "silver",
        "total": 159.99,
        "createdAt": {"$date": "2024-12-20T14:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "680000000000000000000003"},
        "userID": {"$oid": "676000000000000000000004"},
        "productId": {"$oid": "677000000000000000000006"},
        "quantity": 2,
        "size": "S",
        "color": "silver",
        "total": 159.98,
        "createdAt": {"$date": "2024-12-19T16:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "680000000000000000000004"},
        "userID": {"$oid": "676000000000000000000006"},
        "productId": {"$oid": "677000000000000000000001"},
        "quantity": 1,
        "size": "S",
        "color": "rose gold",
        "total": 269.99,
        "createdAt": {"$date": "2024-12-21T09:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "680000000000000000000005"},
        "userID": {"$oid": "676000000000000000000008"},
        "productId": {"$oid": "677000000000000000000011"},
        "quantity": 1,
        "size": "M",
        "color": "silver",
        "total": 212.49,
        "createdAt": {"$date": "2024-12-20T11:20:00.000Z"},
        "__v": 0
    }
]

# Write cartlist data
with open(os.path.join(base_path, "ecommerce.cartlist.json"), "w", encoding="utf-8") as f:
    json.dump(cartlist_data, f, indent=2)
print("✓ CartList data created (5 cart items)")

# ================== WISHLIST DATA ==================
wishlist_data = [
    {
        "_id": {"$oid": "681000000000000000000001"},
        "userID": {"$oid": "676000000000000000000002"},
        "totalItem": 3,
        "detail": {
            "productId": {"$oid": "677000000000000000000003"}
        },
        "createdAt": {"$date": "2024-12-10T15:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000002"},
        "userID": {"$oid": "676000000000000000000002"},
        "totalItem": 3,
        "detail": {
            "productId": {"$oid": "677000000000000000000007"}
        },
        "createdAt": {"$date": "2024-12-12T10:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000003"},
        "userID": {"$oid": "676000000000000000000002"},
        "totalItem": 3,
        "detail": {
            "productId": {"$oid": "677000000000000000000008"}
        },
        "createdAt": {"$date": "2024-12-15T14:20:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000004"},
        "userID": {"$oid": "676000000000000000000004"},
        "totalItem": 2,
        "detail": {
            "productId": {"$oid": "677000000000000000000002"}
        },
        "createdAt": {"$date": "2024-12-18T09:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000005"},
        "userID": {"$oid": "676000000000000000000004"},
        "totalItem": 2,
        "detail": {
            "productId": {"$oid": "677000000000000000000010"}
        },
        "createdAt": {"$date": "2024-12-19T11:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000006"},
        "userID": {"$oid": "676000000000000000000006"},
        "totalItem": 1,
        "detail": {
            "productId": {"$oid": "677000000000000000000003"}
        },
        "createdAt": {"$date": "2024-12-16T16:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000007"},
        "userID": {"$oid": "676000000000000000000008"},
        "totalItem": 2,
        "detail": {
            "productId": {"$oid": "677000000000000000000004"}
        },
        "createdAt": {"$date": "2024-12-17T13:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "681000000000000000000008"},
        "userID": {"$oid": "676000000000000000000008"},
        "totalItem": 2,
        "detail": {
            "productId": {"$oid": "677000000000000000000009"}
        },
        "createdAt": {"$date": "2024-12-20T12:00:00.000Z"},
        "__v": 0
    }
]

# Write wishlist data
with open(os.path.join(base_path, "ecommerce.wishlist.json"), "w", encoding="utf-8") as f:
    json.dump(wishlist_data, f, indent=2)
print("✓ Wishlist data created (8 wishlist items)")

# ================== USER COUPONS DATA ==================
usercoupon_data = [
    {
        "_id": {"$oid": "682000000000000000000001"},
        "userID": {"$oid": "676000000000000000000002"},
        "couponID": {"$oid": "678000000000000000000001"},
        "status": "used",
        "claimedAt": {"$date": "2024-11-01T10:00:00.000Z"},
        "usedAt": {"$date": "2024-11-05T14:30:00.000Z"},
        "orderID": {"$oid": "679000000000000000000001"},
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000002"},
        "userID": {"$oid": "676000000000000000000004"},
        "couponID": {"$oid": "678000000000000000000004"},
        "status": "used",
        "claimedAt": {"$date": "2024-11-10T09:30:00.000Z"},
        "usedAt": {"$date": "2024-12-15T16:45:00.000Z"},
        "orderID": {"$oid": "679000000000000000000003"},
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000003"},
        "userID": {"$oid": "676000000000000000000008"},
        "couponID": {"$oid": "678000000000000000000005"},
        "status": "used",
        "claimedAt": {"$date": "2024-11-20T14:00:00.000Z"},
        "usedAt": {"$date": "2024-12-12T10:30:00.000Z"},
        "orderID": {"$oid": "679000000000000000000006"},
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000004"},
        "userID": {"$oid": "676000000000000000000002"},
        "couponID": {"$oid": "678000000000000000000004"},
        "status": "claimed",
        "claimedAt": {"$date": "2024-12-18T10:00:00.000Z"},
        "usedAt": None,
        "orderID": None,
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000005"},
        "userID": {"$oid": "676000000000000000000003"},
        "couponID": {"$oid": "678000000000000000000003"},
        "status": "claimed",
        "claimedAt": {"$date": "2024-12-15T11:30:00.000Z"},
        "usedAt": None,
        "orderID": None,
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000006"},
        "userID": {"$oid": "676000000000000000000006"},
        "couponID": {"$oid": "678000000000000000000006"},
        "status": "expired",
        "claimedAt": {"$date": "2024-09-02T08:00:00.000Z"},
        "usedAt": None,
        "orderID": None,
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000007"},
        "userID": {"$oid": "676000000000000000000004"},
        "couponID": {"$oid": "678000000000000000000005"},
        "status": "claimed",
        "claimedAt": {"$date": "2024-12-19T14:20:00.000Z"},
        "usedAt": None,
        "orderID": None,
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    },
    {
        "_id": {"$oid": "682000000000000000000008"},
        "userID": {"$oid": "676000000000000000000008"},
        "couponID": {"$oid": "678000000000000000000001"},
        "status": "claimed",
        "claimedAt": {"$date": "2024-12-20T09:00:00.000Z"},
        "usedAt": None,
        "orderID": None,
        "isDeleted": False,
        "deletedAt": None,
        "__v": 0
    }
]

# Write usercoupon data
with open(os.path.join(base_path, "ecommerce.userCoupon.json"), "w", encoding="utf-8") as f:
    json.dump(usercoupon_data, f, indent=2)
print("✓ UserCoupon data created (8 user-coupon relationships)")

# ================== BLOGS DATA ==================
blogs_data = [
    {
        "_id": {"$oid": "683000000000000000000001"},
        "blogID": "BLOG-0001",
        "blogName": "Jewelry Care Guide",
        "blogImg": "/uploads/blogs/jewelry_care.jpg",
        "blogTitle": "How to Properly Care for Your Fine Jewelry",
        "blogType": "jewelry",
        "description": "Learn the best practices for cleaning, storing, and maintaining your precious jewelry pieces to ensure they last a lifetime. Discover expert tips on caring for diamonds, pearls, gold, and silver jewelry.",
        "createdAt": {"$date": "2024-01-25T10:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000002"},
        "blogID": "BLOG-0002",
        "blogName": "Spring Accessories Trends",
        "blogImg": "/uploads/blogs/spring_trends.jpg",
        "blogTitle": "Top 10 Spring Jewelry Trends for 2024",
        "blogType": "accessory",
        "description": "Explore the hottest jewelry trends this spring season! From layered necklaces to statement earrings, discover what's trending in the fashion world and how to incorporate these styles into your wardrobe.",
        "createdAt": {"$date": "2024-03-15T14:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000003"},
        "blogID": "BLOG-0003",
        "blogName": "Gemstone Meanings",
        "blogImg": "/uploads/blogs/gemstone_meanings.jpg",
        "blogTitle": "The Fascinating World of Gemstone Symbolism",
        "blogType": "bling chronicle",
        "description": "Dive deep into the mystical meanings and historical significance of popular gemstones. Learn about birthstones, healing properties, and the cultural importance of rubies, sapphires, emeralds, and more.",
        "createdAt": {"$date": "2024-05-20T11:15:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000004"},
        "blogID": "BLOG-0004",
        "blogName": "Engagement Ring Shopping",
        "blogImg": "/uploads/blogs/engagement_rings.jpg",
        "blogTitle": "The Ultimate Guide to Buying an Engagement Ring",
        "blogType": "jewelry",
        "description": "Everything you need to know before purchasing an engagement ring. From understanding the 4 Cs of diamonds to choosing the perfect setting and determining your budget, this comprehensive guide has you covered.",
        "createdAt": {"$date": "2024-07-10T09:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000005"},
        "blogID": "BLOG-0005",
        "blogName": "New Collection Launch",
        "blogImg": "/uploads/blogs/autumn_collection.jpg",
        "blogTitle": "Introducing Our Autumn Collection 2024",
        "blogType": "news",
        "description": "We're excited to announce the launch of our latest autumn collection! Featuring rich tones, vintage-inspired designs, and contemporary pieces that blend classic elegance with modern style.",
        "createdAt": {"$date": "2024-09-01T15:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000006"},
        "blogID": "BLOG-0006",
        "blogName": "Jewelry Layering Tips",
        "blogImg": "/uploads/blogs/layering_tips.jpg",
        "blogTitle": "Master the Art of Jewelry Layering",
        "blogType": "accessory",
        "description": "Unlock your styling potential with our expert guide to layering necklaces, stacking bracelets, and mixing metals. Learn how to create cohesive looks that showcase your personality and elevate any outfit.",
        "createdAt": {"$date": "2024-10-15T12:30:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000007"},
        "blogID": "BLOG-0007",
        "blogName": "Pearl Jewelry History",
        "blogImg": "/uploads/blogs/pearl_history.jpg",
        "blogTitle": "Pearls Through the Ages: A Historical Journey",
        "blogType": "bling chronicle",
        "description": "Travel through time to discover how pearls have captivated humanity for centuries. From ancient royalty to modern fashion icons, explore the enduring allure of these lustrous gems.",
        "createdAt": {"$date": "2024-11-20T10:45:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000008"},
        "blogID": "BLOG-0008",
        "blogName": "Holiday Gift Guide",
        "blogImg": "/uploads/blogs/holiday_gifts.jpg",
        "blogTitle": "Perfect Jewelry Gifts for Everyone on Your List",
        "blogType": "news",
        "description": "Make this holiday season sparkle with our curated jewelry gift guide. Find the perfect pieces for your loved ones, from timeless classics to trendy statement pieces, all at various price points.",
        "createdAt": {"$date": "2024-12-01T08:00:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000009"},
        "blogID": "BLOG-0009",
        "blogName": "Sustainable Jewelry",
        "blogImg": "/uploads/blogs/sustainable_jewelry.jpg",
        "blogTitle": "Our Commitment to Sustainable and Ethical Jewelry",
        "blogType": "news",
        "description": "Learn about our dedication to ethical sourcing, sustainable practices, and responsible manufacturing. Discover how we're making a positive impact on both people and the planet while creating beautiful jewelry.",
        "createdAt": {"$date": "2024-12-10T13:20:00.000Z"},
        "__v": 0
    },
    {
        "_id": {"$oid": "683000000000000000000010"},
        "blogID": "BLOG-0010",
        "blogName": "Bridal Jewelry Trends",
        "blogImg": "/uploads/blogs/bridal_jewelry.jpg",
        "blogTitle": "2025 Bridal Jewelry Trends You'll Love",
        "blogType": "jewelry",
        "description": "Get inspired by the latest bridal jewelry trends for 2025. From delicate pearl sets to bold statement pieces, find the perfect accessories to complement your wedding day look.",
        "createdAt": {"$date": "2024-12-18T16:00:00.000Z"},
        "__v": 0
    }
]

# Write blogs data
with open(os.path.join(base_path, "ecommerce.blogs.json"), "w", encoding="utf-8") as f:
    json.dump(blogs_data, f, indent=2)
print("✓ Blogs data created (10 blog posts)")

print("\n" + "="*50)
print("SUCCESS! All mockup data files generated:")
print("="*50)
print("• ecommerce.users.json - 8 users (1 admin, 1 seller, 6 customers)")
print("• ecommerce.products.json - 12 jewelry products (all types)")
print("• ecommerce.coupon.json - 6 coupons (active & expired)")
print("• ecommerce.orders.json - 6 orders (various statuses)")
print("• ecommerce.cartlist.json - 5 cart items")
print("• ecommerce.wishlist.json - 8 wishlist entries")
print("• ecommerce.userCoupon.json - 8 user-coupon relationships")
print("• ecommerce.blogs.json - 10 blog posts (all categories)")
print("="*50)
print("\nAll data is interrelated and follows the Mongoose models!")
