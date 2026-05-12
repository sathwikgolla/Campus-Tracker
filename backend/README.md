# CampusTracker Backend

Production-ready Node.js, Express, MongoDB API for CampusTracker.

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Frontend API base:

```env
VITE_API_URL=http://localhost:5000/api
```

Use `Authorization: Bearer <token>` for protected routes.

## API Examples

### Register Student

`POST /api/auth/register`

```json
{
  "name": "Student One",
  "email": "student@cmrit.edu",
  "password": "secure123",
  "role": "student",
  "rollNumber": "23CSE101",
  "branch": "CSE",
  "year": "3",
  "section": "A",
  "phone": "9876543210"
}
```

### Login Student

`POST /api/auth/login`

```json
{
  "email": "student@cmrit.edu",
  "password": "secure123",
  "role": "student"
}
```

### Verify OTP

`POST /api/auth/verify-otp`

```json
{
  "email": "student@cmrit.edu",
  "otp": "123456"
}
```

### Search Faculty

`GET /api/faculty?search=aarav&department=CSE&status=Available`

Headers:

```text
Authorization: Bearer <student-token>
```

### Add Favorite

`POST /api/favorites/:facultyId`

Headers:

```text
Authorization: Bearer <student-token>
```

### Send Request

`POST /api/requests`

```json
{
  "teacherId": "...",
  "facultyProfileId": "...",
  "reason": "Project review request",
  "message": "Sir, I want to discuss my mini project.",
  "requestedTime": "2:00 PM"
}
```

### Teacher Login

`POST /api/auth/login`

```json
{
  "email": "teacher@cmrit.edu",
  "password": "secure123",
  "role": "teacher"
}
```

### Accept Request

`PUT /api/requests/:id/accept`

Headers:

```text
Authorization: Bearer <teacher-token>
```

### Admin Login

`POST /api/auth/login`

```json
{
  "email": "admin@cmrit.edu",
  "password": "secure123",
  "role": "admin"
}
```

### View Admin Analytics

`GET /api/admin/dashboard`

Headers:

```text
Authorization: Bearer <admin-token>
```

## Important Routes

- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/student/dashboard`
- `GET /api/teacher/dashboard`
- `PUT /api/teacher/status`
- `GET /api/admin/dashboard`
- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `GET /api/status`
- `PUT /api/status`
- `GET /api/search/faculty?query=available%20CSE`
- `POST /api/appointments`
- `GET /api/analytics`
- `POST /api/chat`
- `POST /api/broadcasts`
- `GET /api/timetable`
- `POST /api/attendance/sessions`
- `GET /api/themes`
- `GET /api/predictions/faculty/:id`
- `GET /api/events`
- `GET /api/forum`

Faculty search is protected. Without a token, `GET /api/faculty` returns `401`.

## Realtime Events

Socket.io emits:

- `facultyStatusUpdated`
- `newNotification`
- `emergencyBroadcast`
- `requestStatusUpdated`

Clients can join rooms with:

- `joinUser`
- `joinRole`
- `joinDepartment`
