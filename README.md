
# Angular Auth App

## Features
- Login with JWT token authentication
- Role-based route protection (admin and user roles)
- User management (admin only)
- Order management system with calendar view
- Logout functionality
- Angular Material design
- Hebrew/RTL support

## Components
- **Login** - User authentication
- **Home** - Dashboard page
- **Admin Panel** - Admin-only management interface
- **Add User** - User registration (admin only)
- **Add Order** - Order creation (admin only)
- **Orders Calendar** - Calendar view of all orders
- **Navbar** - Navigation with role-based menu items

## Services
- **AuthService** - Authentication, token management, and user role handling
- **OrderService** - Order management and API communication

## Guards
- **AuthGuard** - Protects routes for authenticated users
- **AdminGuard** - Protects admin-only routes
- **LoginGuard** - Redirects authenticated users away from login page

## Models
- **Order** - Order data structure with validation
- **OrderEvent** - Calendar event structure
- **OrderType** - Enumeration of available order types

## Features
- JWT token-based authentication with automatic refresh
- Hebrew/RTL interface support
- Responsive design with Angular Material
- Full calendar integration for order visualization
- Form validation and error handling
- Interceptor for automatic token handling

## Dependencies
All required dependencies are properly configured in package.json:
- Angular 17+ with Material Design
- FullCalendar for calendar functionality
- RxJS for reactive programming
- TypeScript for type safety

## How to run
1. `npm install`
2. `ng serve`
3. Navigate to `http://localhost:4200`

## API Endpoints
Base URL: `http://127.0.0.1:5000`
- `/auth/login` - User login
- `/auth/logout` - User logout
- `/auth/register` - User registration
- `/auth/verify` - Token verification
- `/auth/refresh` - Token refresh
- `/orders/addorder` - Create new order
- `/orders/getorders` - Retrieve all orders
