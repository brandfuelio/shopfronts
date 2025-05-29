# ShopFronts Backend

A comprehensive backend for the ShopFronts conversational AI-powered digital product marketplace.

## Architecture Overview

The backend is built with:
- **TypeScript** for type safety
- **Express.js** as the web framework
- **Prisma** as the ORM
- **PostgreSQL** for the database
- **Redis** for caching and sessions
- **JWT** for authentication

## Features Implemented

### 1. Authentication & Authorization
- User registration with email verification
- Login with JWT tokens
- Refresh token rotation
- Password reset functionality
- Role-based access control (Customer, Seller, Admin)

### 2. Product Management
- Full CRUD operations for products
- Advanced search and filtering
- Category hierarchy support
- Product images and variants
- Stock tracking

### 3. AI-Powered Chat
- Conversational product discovery
- Context-aware responses
- Session management
- Product recommendations (currently using mock AI)

### 4. E-commerce Features
- Shopping cart management
- Order processing with status tracking
- Review system with helpful voting
- Wishlist functionality

### 5. Seller Dashboard
- Sales analytics
- Order management
- Product inventory
- Payout tracking
- Performance metrics

### 6. Admin Panel
- User management
- Platform analytics
- Category management
- System settings
- Order oversight

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller)
- `PUT /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Chat
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions/:id` - Get session history
- `POST /api/chat/sessions/:id/messages` - Send message
- `GET /api/chat/sessions` - List user sessions

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update status (Admin/Seller)

### Reviews
- `GET /api/reviews/products/:id` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark as helpful

### User Profile
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `GET /api/users/stats` - Get user statistics

### Seller Routes
- `GET /api/seller/dashboard` - Dashboard stats
- `GET /api/seller/orders` - Seller orders
- `GET /api/seller/products` - Seller products
- `GET /api/seller/analytics` - Sales analytics
- `GET /api/seller/payouts` - Payout history

### Admin Routes
- `GET /api/admin/dashboard` - Platform stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/analytics` - Platform analytics

## Database Schema

The database includes the following models:
- User (with roles and profiles)
- Product (with variants and images)
- Category (hierarchical)
- Order & OrderItem
- Review & ReviewHelpful
- Cart & CartItem
- ChatSession & ChatMessage
- WishlistItem
- SellerProfile
- AdminProfile

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

## Next Steps

### High Priority
1. **Email Service Integration**
   - Set up email templates
   - Implement email queue with Redis
   - Add transactional emails (order confirmation, etc.)

2. **AI Service Integration**
   - Replace mock AI responses with actual AI service
   - Implement product recommendation engine
   - Add natural language search

3. **File Upload Service**
   - Set up file storage (S3 or local)
   - Implement image optimization
   - Add file validation

4. **Payment Integration**
   - Integrate payment gateway (Stripe/PayPal)
   - Implement webhook handlers
   - Add payment method management

### Medium Priority
5. **Caching Layer**
   - Implement Redis caching for products
   - Add response caching
   - Cache invalidation strategies

6. **API Documentation**
   - Set up Swagger/OpenAPI
   - Generate API documentation
   - Add example requests/responses

7. **Testing**
   - Unit tests for controllers
   - Integration tests for API endpoints
   - E2E tests for critical flows

8. **Security Enhancements**
   - Rate limiting
   - Input sanitization
   - SQL injection prevention
   - XSS protection

### Low Priority
9. **Performance Optimization**
   - Database query optimization
   - Add database indexes
   - Implement pagination cursors

10. **Monitoring & Logging**
    - Set up structured logging
    - Add APM (Application Performance Monitoring)
    - Error tracking (Sentry)

## Development Guidelines

1. **Code Style**
   - Use TypeScript strict mode
   - Follow ESLint rules
   - Write self-documenting code

2. **Git Workflow**
   - Feature branches
   - Meaningful commit messages
   - PR reviews required

3. **Testing**
   - Write tests for new features
   - Maintain >80% code coverage
   - Test edge cases

4. **Security**
   - Never commit secrets
   - Validate all inputs
   - Use parameterized queries
   - Implement proper CORS

## Deployment

The application is ready for deployment with:
- Docker support
- Environment-based configuration
- Health check endpoints
- Graceful shutdown handling

For production deployment:
1. Set up production database
2. Configure environment variables
3. Set up reverse proxy (Nginx)
4. Enable SSL/TLS
5. Set up monitoring
6. Configure backups