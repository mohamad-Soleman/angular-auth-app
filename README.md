
# Angular Auth App

## Features
- Login with JWT token
- Role-based route guard (admin only)
- Add user form
- Logout functionality
- Angular Material design

## Components
- Login
- Home
- Admin Panel (admin only)
- Add User (admin only)

## Services
- AuthService for login/logout/token handling

## Guards
- AuthGuard: protects routes for authenticated users
- AdminGuard: protects admin-only routes

## Config
- `environment.ts` holds base API URLs

## How to run
1. `npm install`
2. `ng serve`
