# MitPix Aura Studio

Production-oriented salon booking app with role-based Customer, Employee, and Admin modes.

## Stack

- React Native CLI
- React Navigation
- React Native Paper
- Zustand
- AsyncStorage
- Axios
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT + bcrypt

## Structure

```text
MitPix Aura Studio/
  backend/   Express REST API
  mobile/    React Native CLI app source
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`.

The server seeds the first admin automatically from env values on startup.

## Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env
npm start
npm run android
```

Set `API_BASE_URL` in `mobile/.env` to the live Render backend URL:

```text
API_BASE_URL=https://mitpixaurastudio.onrender.com/api
```

After changing this value, rebuild the APK because React Native dotenv values are bundled at build time.

## Key API Flows

- Customer login: `POST /api/auth/customer-login` with `{ "phone": "9999999999", "name": "Amit" }`
- Employee/admin login: `POST /api/auth/staff-login` with `{ "email": "...", "password": "..." }`
- Admin creates salons, employees, services, offers.
- Slots are generated automatically per employee per date in 30-minute intervals from salon opening to closing time.
- Employees can only update their own slots.

## Security Notes

- Do not commit `.env` or `.env.local`.
- JWT-protected routes use `Authorization: Bearer <token>`.
- Admin APIs require role `admin`.
- Employee slot APIs enforce owner checks.
