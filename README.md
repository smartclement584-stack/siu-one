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

## Installable app (PWA)

The service worker only exists in the built app, not under `npm run dev`:

```bash
npm run preview:all     # builds, then serves the API on :4000 and the app on :4173
```

- **Desktop (Chrome / Edge):** open http://localhost:4173 and use the install icon in the address bar.
- **Android over USB:** enable USB debugging, open `chrome://inspect` on the computer, forward ports `4173` and `4000`, then open `http://localhost:4173` on the phone and choose "Install app".
- **Any other phone, including iPhone:** the app and the API must both be served over **HTTPS**. Build with `VITE_API_URL=https://<api-host>/api` and add the app's origin to `CORS_ORIGIN`. Plain `http://<computer-ip>` will not install.

Offline, only the app shell opens. No API data is cached, so signing in and viewing records need a connection.
A service worker stays registered for `localhost:4173`; rebuild to update it.

## Demo accounts (from the seed)

| Role     | ID                      | Password       |
| -------- | ----------------------- | -------------- |
| Student  | `SIU001` ... `SIU005`   | `Student123!`  |
| Delegate | `DEL001`                | `Delegate123!` |
| Staff    | `STF001`                | `Staff123!`    |
| Admin    | `ADM001`                | `Admin123!`    |

The role/permission matrix is documented at the top of `backend/src/middleware/auth.js`.

Passwords are stored as bcrypt hashes. Change these before any real deployment.

## Configuration

`backend/.env` (see `backend/.env.example`): `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (comma-separated; an older `.env` needs `http://localhost:4173` added for the built app).
The frontend calls `http://localhost:4000/api` by default; override with `VITE_API_URL`.

## API

All routes are under `/api`. Everything except register/login needs `Authorization: Bearer <token>`.

| Method | Route                              | Access                     |
| ------ | ---------------------------------- | -------------------------- |
| POST   | `/auth/register`                   | public                     |
| POST   | `/auth/login`                      | public                     |
| POST   | `/auth/delegate-login`             | public                     |
| POST   | `/auth/staff-login`                | public (staff and admin)   |
| GET    | `/auth/me`                         | any signed-in user         |
| GET    | `/students`                        | delegate (class), staff (taught classes), admin |
| GET    | `/courses`                         | any signed-in user, filtered by role |
| POST   | `/courses`                         | admin                      |
| PATCH  | `/courses/:id`                     | admin (`active: false` deactivates) |
| GET    | `/staff`                           | admin                      |
| GET    | `/class-sessions`                  | staff (own courses), admin |
| POST   | `/class-sessions`                  | staff (own courses), admin |
| DELETE | `/class-sessions/:id`              | staff (own courses), admin; only before attendance exists (kept in the file, marked cancelled) |
| GET    | `/attendance/sessions`             | delegate (class), staff (own courses), admin |
| POST   | `/attendance/sessions`             | delegate (class), staff (own courses), admin |
| GET    | `/attendance/student/:matricule`   | that student; delegate / staff / admin within scope |
| GET    | `/disputes`                        | student (own), reviewers within scope |
| POST   | `/disputes`                        | student, own record        |
| PATCH  | `/disputes/:id`                    | delegate / staff / admin within scope |
| GET    | `/announcements`, `/events`        | any signed-in user         |
| POST   | `/announcements`, `/events`        | admin                      |
| PATCH  | `/announcements/:id`, `/events/:id` | admin                     |
| DELETE | `/announcements/:id`, `/events/:id` | admin (kept in the file, marked deleted) |
| GET    | `/goals/:matricule`                | that student only          |
| PUT    | `/goals/:matricule`                | that student only          |

Notes:
- A "class" is one department at one level. Students and delegates see only their class's active courses.
- Every attendance record references a class session. Staff send `classSessionId`. The delegate screen sends trimester, week, discipline and date, and the server finds or creates the matching session.
- A record must mark **every** student in the course's class (Present / Absent / Late) and stores `createdBy` and `createdAt`.
- A class session takes one attendance record. A second save is refused (409) for every role.
- A cancelled session is hidden, takes no attendance and frees its slot. If a delegate later saves attendance for that same course, trimester, week and date, a new session is created.
- Approving a dispute updates the attendance record and appends to its `corrections` list (from, to, who, when). Each record can be disputed once per student.
- `GET /attendance/student/:matricule` returns the aggregated counts, `attendancePercentage` (Present + Late over total, `null` if no sessions), a per-discipline breakdown and that student's own per-session statuses.
- `GET /goals/:matricule` returns `null` when no goal is saved.

## Not backed by data yet

The MVP has no grades or assignments data, so the dashboard shows no GPA or assignment counts, and those menu items are disabled. The delegate "Generate Recap" shows an on-page summary; nothing is sent to a teacher.
