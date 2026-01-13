# Copilot Instructions for express_me

## Project Overview
This is a Node.js/Express backend for an e-commerce platform, using MongoDB via Mongoose. The codebase is organized by feature, with clear separation between models, controllers, routes, middleware, and utility functions. Data is stored in JSON files for mockup/testing and MongoDB for production.

## Architecture & Data Flow
- **Entry Point:** `server.js` initializes the app, loads config, connects to MongoDB, and sets up middleware and routes.
- **Models:** Located in `models/`, each file defines a Mongoose schema for a domain entity (e.g., `User.js`, `Product.js`, `Order.js`). Relationships are managed via `ObjectId` references.
- **Controllers:** In `controllers/`, each controller handles business logic for a resource. Controllers are thin and expect validation/middleware to handle auth, error, and request logging.
- **Routes:** In `routes/`, each file maps HTTP endpoints to controller methods. Route files are named after the resource (e.g., `product.js`).
- **Middleware:** In `middleware/`, reusable logic for auth, error handling, logging, CORS, and file uploads.
- **Utils:** In `utils/`, shared helpers (e.g., `generateID.js`, `logEvent.js`, `cronJobs.js`).
- **Data:** In `data/`, mockup and test data in JSON format. Used for local development and testing.

## Developer Workflows
- **Start Server:**
  ```sh
  node server.js
  ```
- **Database:**
  - Uses MongoDB. Connection config in `config/connectDB.js`.
  - For local dev, mock data in `data/` can be loaded manually.
- **Testing:**
  - No automated test runner configured. Manual testing via API clients (e.g., Postman) and test JSONs in `data/test/`.
- **Logging:**
  - Requests and errors are logged to `logs/requestLog.txt` via custom middleware.
- **Uploads:**
  - File uploads (images) are stored in `public/uploads/`.

## Project Conventions & Patterns
- **Controllers:** Always async, return JSON, and never send raw errors (use `errorHandler.js`).
- **Models:** Use Mongoose virtuals and methods for computed fields and business logic (see `UserCoupon.js`).
- **Routes:** Grouped by resource, use RESTful naming.
- **Middleware:** All routes pass through logging, error, and auth middleware as needed.
- **Data Relationships:** Managed via Mongoose `ref` fields. See `data/DATA_RELATIONSHIPS.md` for details.
- **Mock/Test Data:** Place new mock data in `data/mockup/` or `data/test/` as appropriate.

## Integration Points
- **MongoDB:** All persistent data via Mongoose models.
- **File Uploads:** Handled by custom middleware in `middleware/createUploader.js`.
- **CORS & Security:** Configured in `config/corsOption.js` and `middleware/credentials.js`.

## Key Files & Directories
- `server.js` — App entry point
- `models/` — Mongoose schemas
- `controllers/` — Business logic
- `routes/` — API endpoints
- `middleware/` — Cross-cutting concerns
- `utils/` — Shared helpers
- `data/` — Mock/test data
- `logs/` — Request/error logs

## Example Patterns
- **Model Method:** See `UserCoupon.js` for static and instance methods for coupon expiry.
- **Error Handling:** All errors pass through `middleware/errorHandler.js`.
- **Request Logging:** All requests pass through `middleware/logRequest.js`.

---
For questions about data relationships, see `data/DATA_RELATIONSHIPS.md`.
For mock/test data conventions, see `data/README.md` and `data/TESTING_REFERENCE.md`.
