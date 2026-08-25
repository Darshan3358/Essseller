# MySQL to MongoDB Backend Project

This is a Node.js/Express/MongoDB backend server migrated from a MySQL database schema. It provides RESTful APIs for managing Sellers, Products, Orders, and more.

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **Authentication**: JWT & bcryptjs

## Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory (already provided as example):
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/smartseller_backend
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development
    ```

3.  **Run Application**:
    ```bash
    # Development mode
    npm run dev
    # OR
    node server.js
    ```

4.  **Seed Database** (Optional):
    Populate the database with initial Admin and User data.
    ```bash
    node utils/seeder.js
    ```
    To destroy data:
    ```bash
    node utils/seeder.js -d
    ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new seller
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/profile` - Get user profile (Protected)

### Products
- `GET /api/products` - Get all products (Pagination, Search)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Soft delete product (Protected)

### Orders
- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/myorders` - Get logged-in user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/pay` - Update payment status

## Project Structure
- `/config`: Database configuration
- `/controllers`: Route logic
- `/middleware`: Custom middleware (auth, error)
- `/models`: Mongoose schemas (Mapped from SQL)
- `/routes`: API route definitions
- `/utils`: Helper classes (APIFeatures, Seeder)
