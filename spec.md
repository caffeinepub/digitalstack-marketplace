# DigitalStack Marketplace

## Current State
New project. Empty Motoko backend and no frontend components yet.

## Requested Changes (Diff)

### Add
- Full digital products marketplace with storefront, product listing, cart, and checkout
- Cashfree payment gateway integration via HTTP outcalls (create order, verify payment)
- Admin dashboard to manage products, view orders, and track revenue
- Product categories: Templates, eBooks, Software, Courses
- Product management: create/update/delete products with name, description, price, category, image URL, file download URL
- Shopping cart (frontend state)
- Order management: create order, store payment status, allow download after payment
- User authentication (admin role vs buyer)
- Featured products and top sellers sections
- Search and filter by category

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
1. Product data model: id, name, description, price (in paise), category, imageUrl, fileUrl, isFeatured, salesCount, createdAt
2. Order data model: id, buyerPrincipal, productIds, totalAmount, cashfreeOrderId, paymentStatus (pending/paid/failed), createdAt
3. Public APIs:
   - getProducts() - list all active products
   - getProduct(id) - get single product
   - getFeaturedProducts() - get featured products
   - getTopSellers() - top by salesCount
   - searchProducts(query, category) - filtered search
4. Admin APIs (authorization-gated):
   - createProduct, updateProduct, deleteProduct
   - getOrders, getAdminStats (total revenue, order count, product count)
5. Order/payment APIs:
   - createOrder(productIds) - creates order record, calls Cashfree via HTTP outcall to get payment link
   - verifyPayment(orderId, cashfreeOrderId) - verify via Cashfree API, mark paid, increment sales
   - getMyOrders() - buyer's orders
   - getDownloadUrl(orderId, productId) - returns file URL if order is paid

### Frontend
- Storefront: hero banner, featured products grid, top sellers, category nav
- Product listing page with search and category filter
- Product detail modal/page
- Cart sidebar/drawer
- Checkout flow with Cashfree payment redirect
- Admin dashboard: product CRUD, orders table, revenue stats
- Download access after successful payment
