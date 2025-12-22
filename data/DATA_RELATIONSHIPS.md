# Data Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ECOMMERCE DATA STRUCTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    USERS     │ (8 users)
│              │
│ • Admin123   │────────┐ creates coupons
│ • Sarah2024  │─┐      │
│ • Michael99  │ │      │
│ • Emily2025  │ │      ▼
│ • David2023  │ │  ┌──────────┐
│ • Jessica88  │ │  │ COUPONS  │ (6 coupons)
│ • Robert77   │ │  │          │
│ • Amanda99   │ │  │ CPN-001  │ WELCOME10 (active)
└──────────────┘ │  │ CPN-002  │ SUMMER25 (expired)
       │         │  │ CPN-003  │ FIXED50 (active)
       │         │  │ CPN-004  │ HOLIDAY15 (active)
       │         │  │ CPN-005  │ VIP20 (active)
       │         │  │ CPN-006  │ FLASH30 (expired)
       │         │  └──────────┘
       │         │       │
       │         │       │ claimed/used by
       │         │       │
       │         │       ▼
       │         │  ┌────────────────┐
       │         │  │  USER COUPONS  │ (8 relationships)
       │         │  │                │
       │         │  │ • 3 used       │
       │         │  │ • 4 claimed    │
       │         │  │ • 1 expired    │
       │         │  └────────────────┘
       │         │
       │         │  places orders
       │         ▼
       │    ┌──────────┐
       │    │  ORDERS  │ (6 orders)
       │    │          │
       │    │ ORD-00001│ Sarah → delivered
       │    │ ORD-00002│ Michael → processing
       │    │ ORD-00003│ Emily → shipped
       │    │ ORD-00004│ Jessica → placed
       │    │ ORD-00005│ Sarah → cancelled
       │    │ ORD-00006│ Amanda → delivered
       │    └──────────┘
       │         │
       │         │ contains products
       │         │
       │         ▼
       │    ┌─────────────┐
       │    │  PRODUCTS   │ (12 products)
       │    │             │
       │    │ Earrings (3)│ PROD-001, 005, 009
       │    │ Necklaces(3)│ PROD-002, 006, 010
       │    │ Rings (3)   │ PROD-003, 007, 011
       │    │ Bracelets(3)│ PROD-004, 008, 012
       │    └─────────────┘
       │         │         │
       │         │         │ featured in
       │         │         ▼
       │    ┌────┴────────────┐
       │    │                 │
       │    ▼                 ▼
       │  ┌──────────┐  ┌────────────┐
       │  │ CARTLIST │  │  WISHLIST  │
       └─▶│          │  │            │
          │ 5 items  │  │  8 items   │
          │          │  │            │
          │ Sarah: 2 │  │ Sarah: 3   │
          │ Emily: 1 │  │ Emily: 2   │
          │Jessica:1 │  │Jessica: 1  │
          │Amanda: 1 │  │ Amanda: 2  │
          └──────────┘  └────────────┘

┌──────────────┐
│    BLOGS     │ (10 blog posts)
│              │
│ Jewelry (3)  │ Care guides, trends
│ Accessory (2)│ Spring trends, layering
│ Chronicle(2) │ Gemstones, pearls history
│ News (3)     │ Collections, gifts, sustainability
└──────────────┘


═══════════════════════════════════════════════════════════════════════════════
KEY RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════════

USER → ORDERS:         1 user can have multiple orders
USER → CARTLIST:       1 user can have multiple cart items
USER → WISHLIST:       1 user can have multiple wishlist entries
USER → USER_COUPONS:   1 user can claim multiple coupons
USER → COUPONS:        Admin creates coupons

ORDER → PRODUCTS:      1 order contains multiple products
ORDER → COUPONS:       1 order can use 1 coupon
ORDER → USERS:         1 order belongs to 1 user

CARTLIST → PRODUCTS:   Each cart item references 1 product
CARTLIST → USERS:      Each cart item belongs to 1 user

WISHLIST → PRODUCTS:   Each wishlist entry references 1 product
WISHLIST → USERS:      Each wishlist belongs to 1 user

USER_COUPON → USERS:   Links user to coupon
USER_COUPON → COUPONS: Tracks coupon usage
USER_COUPON → ORDERS:  Records which order used the coupon

═══════════════════════════════════════════════════════════════════════════════
SAMPLE DATA FLOW
═══════════════════════════════════════════════════════════════════════════════

1. Sarah2024 (customer) logs in
2. Browses products → adds PROD-005 (Emerald Earrings) to wishlist
3. Adds PROD-001 (Diamond Earrings) to cart
4. Claims WELCOME10 coupon
5. Proceeds to checkout
6. Creates order ORD-00001 with:
   - 2 products (PROD-001, PROD-006)
   - Applies WELCOME10 coupon (10% discount)
   - Total: $431.38 (includes shipping & tax)
7. Order progresses: placed → processing → shipped → delivered
8. UserCoupon record updated: status "used", linked to ORD-00001

═══════════════════════════════════════════════════════════════════════════════
DATA CONSISTENCY CHECKS
═══════════════════════════════════════════════════════════════════════════════

✓ All order userIDs exist in users collection
✓ All order product IDs exist in products collection
✓ All cart/wishlist userIDs and productIds are valid
✓ All userCoupon references exist (user, coupon, order)
✓ Coupon creators (createdBy) reference admin user
✓ Order totals calculated correctly with discounts
✓ Product variants have proper size/color combinations
✓ All dates in chronological order
✓ Enum values match model definitions
✓ Required fields populated for all documents

═══════════════════════════════════════════════════════════════════════════════
