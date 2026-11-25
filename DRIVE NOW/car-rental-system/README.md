# EasyDrive Car Rental System

A React + Vite student project with user/admin modules and browser Local Storage.

## Run locally
1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. Open Terminal in this folder.
4. Run `npm install`
5. Run `npm run dev`
6. Open the localhost URL shown in the terminal.

## Demo admin login
- Email: admin@easydrive.com
- Password: admin123

## Features
- Responsive home page and car listing
- User signup and login with basic validation
- Admin login (demo credentials above)
- Local Storage for users, cars, bookings and login session
- Admin: add/edit/delete cars, view users and bookings
- User: browse cars, book cars, view/cancel bookings
- Session persists after refresh; logout clears session

## Important project note
This is a front-end academic demonstration. Local Storage is not secure authentication or a production database. Passwords are stored in the browser for demonstration only. Do not use real personal passwords. Admin credentials are visible in the source code and are not suitable for a real application.

## Reset demo data
In browser DevTools > Application > Local Storage, remove keys beginning with `easydrive_`, then refresh.
