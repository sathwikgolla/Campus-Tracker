# CampusTracker Production Testing Checklist

## Frontend

- Verify `/`, `/auth`, `/verify-otp`, `/student-dashboard`, `/teacher-dashboard`, `/admin-dashboard`, `/smart-campus`, `/campus-map`, `/events`, and `/forum` render without console errors.
- Verify the global Back button appears on every non-home route and uses React Router navigation without a full page reload.
- Verify protected dashboard routes redirect unauthenticated users to `/auth`.
- Verify role mismatches redirect users to their own dashboard.
- Verify refresh preserves valid authenticated sessions and clears invalid sessions.
- Verify logout removes `campustracker:token` and `campustracker:user`.

## Authentication

- Register as student, teacher, and admin using real data.
- Confirm registration calls `POST /api/auth/send-registration-otp`.
- Confirm no `User` document exists before OTP verification.
- Verify wrong OTP returns `Invalid OTP.`
- Verify expired OTP returns `OTP expired. Please request a new OTP.`
- Verify resend OTP calls `POST /api/auth/resend-registration-otp`.
- Verify correct OTP creates the real user and redirects back to login.
- Verify login fails for unverified or wrong-role accounts.

## Student Dashboard

- Sidebar: Dashboard, Search Faculty, Favorites, Notifications, Profile, Logout.
- Faculty data loads from `GET /api/faculty`.
- Search filters by name, department, subject, cabin, email, status, and location.
- Faculty details modal opens and closes with Back.
- Favorites update count and list state.
- Recent searches are created only after real searches.
- Appointment request calls backend `/api/requests`.
- CampusBot answers from real faculty data.
- Mobile drawer opens, closes, and has no horizontal overflow.

## Teacher Dashboard

- Sidebar: Dashboard, Update Availability, Student Requests, Open Slots, Notifications, Profile, Settings, Logout.
- Dashboard loads from `GET /api/teacher/dashboard`.
- Status update calls `PUT /api/teacher/status`.
- Manual status override affects live status.
- Open slot creation calls `POST /api/teacher/slots`.
- Slot deletion calls `DELETE /api/teacher/slots/:id`.
- Request accept/reject calls `/api/requests/:id/accept` and `/api/requests/:id/reject`.
- Notifications show only real action-created items.
- Mobile drawer and sticky sidebar behavior work.

## Admin Dashboard

- Dashboard analytics load from `GET /api/admin/dashboard`.
- Manage Users, Manage Faculty, Departments, Broadcasts, Analytics, and Reports sections are navigable.
- Department and faculty counts are dynamic.
- Timetable entry count reflects imported JSON data.
- Mobile drawer works without horizontal overflow.

## Backend API

- `GET /api/health` returns success.
- `POST /api/auth/send-registration-otp`
- `POST /api/auth/verify-registration-otp`
- `POST /api/auth/resend-registration-otp`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/faculty` rejects unauthenticated users.
- `GET /api/faculty` supports `search`, `department`, `status`, `location`, `page`, and `limit`.
- `GET /api/faculty/:id` increments profile views.
- `GET /api/timetable`
- `GET /api/timetable/teacher/:teacherId`
- `GET /api/student/dashboard`
- `GET /api/teacher/dashboard`
- `GET /api/admin/dashboard`
- Notification mark read, mark all read, and delete work.

## Import And Data

- Run `npm run import:data`.
- Confirm real teachers, timetable entries, and departments import.
- Run `npm run import:additional-teachers`.
- Confirm duplicate teachers are skipped or updated by email, employeeId, or teacherId.
- Confirm student search shows all imported faculty.
- Confirm teachers with no timetable show `No timetable available`.

## Security

- Confirm no password is returned by any API.
- Confirm JWT is required for protected APIs.
- Confirm rate limits are active on auth routes.
- Confirm Helmet headers are present.
- Confirm CORS allows configured frontend origins and blocks unknown origins.
- Confirm `.env` is not committed and `.env.example` has placeholders only.

## Deployment

- Frontend: set `VITE_API_URL=https://your-render-api.onrender.com/api`.
- Backend: set `CLIENT_URL=https://your-vercel-app.vercel.app`.
- Backend: set MongoDB Atlas `MONGO_URI`.
- Backend: set real Gmail App Password or production mail provider credentials.
- Run frontend `npm run build`.
- Run backend `npm start`.
