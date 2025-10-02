# Book Review Platform (MERN)

A fullstack MERN app where users can sign up, log in, add books, and write reviews with ratings. Includes JWT auth, CRUD for books and reviews, pagination, average ratings, search/sort, profile page, rating charts, and dark mode.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Atlas), Mongoose, JWT, bcrypt
- Frontend: React (Vite), React Router, Axios, Recharts

## Monorepo Layout
```
/backend           # Express API
/frontend          # React SPA
```

## Environment Variables
Create a `.env` file inside `backend`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

Optionally set `VITE_API_BASE` in frontend (for production builds):
```
# inside frontend service env (Railway) or .env if self-hosting
VITE_API_BASE=https://your-backend-host
```

## Local Development
1) Backend
```
cd backend
npm install
npm start
# API will listen on PORT (default 5000)
```

2) Frontend
```
cd frontend
npm install
npm run dev
# Vite dev server on http://localhost:3000 (proxy to backend is configured in vite.config.js)
```

## Key Features
- Auth: Signup/Login with bcrypt-hashed passwords and JWT; auth middleware protects routes
- Books: Add/Update/Delete with ownership checks; List + Details; Pagination (5/page)
- Reviews: Add/Edit/Delete, 1–5 ratings, average rating on Book Details
- UI/UX: Styled pages, search/sort on list, profile page, dark mode toggle, rating distribution chart

## API (Brief)
- Auth
  - POST `/api/auth/signup` { name, email, password }
  - POST `/api/auth/login` { email, password }
- Books
  - GET `/api/books?page=1` → paginated list (includes `avgRating`)
  - GET `/api/books/:id` → book + reviews + `avgRating`
  - GET `/api/books/mine` (auth) → current user’s books
  - POST `/api/books` (auth) { title, author, description, genre, year }
  - PUT `/api/books/:id` (auth, owner)
  - DELETE `/api/books/:id` (auth, owner)
- Reviews
  - POST `/api/reviews` (auth) { bookId, rating, reviewText }
  - PUT `/api/reviews/:id` (auth, owner)
  - DELETE `/api/reviews/:id` (auth, owner)
  - GET `/api/reviews/mine` (auth)

All auth-protected routes require header: `Authorization: Bearer <token>`

## Frontend Pages
- `/` Book list (pagination, search, sort)
- `/book/:id` Book details, reviews, average rating, rating chart
- `/add-book` Add book (protected)
- `/edit-book/:id` Edit book (protected, owner only)
- `/login`, `/register`
- `/profile` Your books and reviews (protected)

## Deployment on Railway
Option A: Two services (recommended)
- Backend service
  - Root: `backend`
  - Build: `npm ci`
  - Start: `npm start`
  - Variables: `MONGODB_URI`, `JWT_SECRET` (Railway sets `PORT`)
- Frontend service (Static Site)
  - Root: `frontend`
  - Build: `npm ci && npm run build`
  - Publish Directory: `dist`
  - Variables: `VITE_API_BASE=https://<your-backend-service>.up.railway.app`

Option B: Single service (serve SPA from Express)
- Build frontend during backend build and serve `frontend/dist` via Express static + SPA fallback
- Pros: single URL; Cons: slightly more setup

## Notes
- Ensure MongoDB Atlas IP access and user credentials are set
- Use strong `JWT_SECRET`
- For production, set `VITE_API_BASE` so the frontend calls your deployed backend

## License
MIT
