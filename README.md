# Survey App - Firebase Integration

## Features Added
- **Firebase Auth + Firestore DB**: Real user auth and data storage
- **Forgot Password**: Link in /auth/login
- **Admin Panel**: Role-based admin access at /admin
- **Single Login Flow**: Use /auth/login for all users (admin included)

## How Admin Works (Role-Based)
1. **Login as Admin**:
   - Go to http://localhost:3001/auth/login
   - Email: `admin@survey.ke`
   - Password: `admin123`
   - Login → role check loads

2. **Set Admin Role (One Time)**:
   - **Option 1 - Firebase Console** (recommended):
     - Go to https://console.firebase.google.com/project/survey-pro-46195/firestore
     - Find document users/admin@survey.ke (or uid from login)
     - Edit `role` to "admin"
   - **Option 2 - In-App**:
     - Login as any user → /admin (if role admin, or first make yourself admin via console)
     - Use "Make Admin" button on any user row

3. **Admin Access**:
   - After role='admin', Navbar shows Admin Dashboard link
   - /admin shows user list, stats, role management
   - All data in Firestore /users collection

## Test Flow
1. `npm run dev` (running on 3001)
2. Signup new user at /auth/signup → /dashboard (role='user')
3. Login admin@survey.ke/admin123 → set role='admin' → /admin nav appears
4. Forgot password test at /auth/login

## Firebase Console Links
- Project: survey-pro-46195
- Auth Users: https://console.firebase.google.com/project/survey-pro-46195/authentication/users
- Firestore Data: https://console.firebase.google.com/project/survey-pro-46195/firestore/data/users

All set! Role-based access ready.
