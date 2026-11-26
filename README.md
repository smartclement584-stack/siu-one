# SIU One

Role-based academic portal MVP for Seven International University.

- **Frontend:** React + Vite (`src/`), port **5173**
- **Backend:** Node.js + Express with JSON files as the database (`backend/`), port **4000**

All data is fictional seed data. The JSON "database" is for the MVP only.

## Quick start

```bash
npm run install:all     # installs root + backend dependencies
cp backend/.env.example backend/.env   # then set JWT_SECRET to a long random string
npm run seed            # (re)creates backend/data/*.json with demo data
npm run dev:all         # API on :4000 and Vite on :5173 together
```

Open http://localhost:5173.

Run them separately if you prefer: `npm run dev:api` (nodemon) and `npm run dev` (Vite).

> `npm run seed` **overwrites** everything in `backend/data/`, including registered students and saved attendance. Use it to reset to the demo state.

## Demo accounts (from the seed)

| Role     | ID                      | Password       |
| -------- | ----------------------- | -------------- |
| Student  | `SIU001` ... `SIU005`   | `Student123!`  |
| Delegate | `DEL001`                | `Delegate123!` |

Passwords are stored as bcrypt hashes. Change these before any real deployment.

## Configuration

`backend/.env` (see `backend/.env.example`): `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`.
The frontend calls `http://localhost:4000/api` by default; override with `VITE_API_URL`.

## API

All routes are under `/api`. Everything except register/login needs `Authorization: Bearer <token>`.

| Method | Route                              | Access                     |
| ------ | ---------------------------------- | -------------------------- |
| POST   | `/auth/register`                   | public                     |
| POST   | `/auth/login`                      | public                     |
| POST   | `/auth/delegate-login`             | public                     |
| GET    | `/students`                        | delegate / admin           |
| GET    | `/attendance/sessions`             | delegate / admin           |
| POST   | `/attendance/sessions`             | delegate / admin           |
| GET    | `/attendance/student/:matricule`   | that student, or delegate  |
| GET    | `/announcements`, `/events`, `/courses` | any signed-in user    |
| GET    | `/goals/:matricule`                | that student, or delegate  |
| PUT    | `/goals/:matricule`                | that student, or delegate  |

Notes:
- A new attendance session must mark **every** registered student (Present / Absent / Late). The saved record stores `createdBy` and `createdAt`.
- `GET /attendance/student/:matricule` returns the aggregated counts, `attendancePercentage` (Present + Late over total, `null` if no sessions) and a per-discipline breakdown, so the dashboard only renders it.
- `GET /goals/:matricule` returns `null` when no goal is saved.

## Not backed by data yet

On the student dashboard, Current GPA and Assignments are still static placeholders, because the MVP has no grades or assignments data. "Send Recap to Teacher" is not wired.
