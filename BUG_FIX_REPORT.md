# CampusTracker Bug Fix Report

## Bugs Found And Fixed

- Registration created permanent users before OTP verification.
  - Added `PendingRegistration` flow so users are created only after OTP verification.

- OTP re-registration was blocked by stranded unverified users.
  - Added legacy cleanup for matching unverified users from the old flow.

- OTP email failures were hard to diagnose.
  - Added strict email env validation, Gmail App Password whitespace cleanup, and a development-only email test route.

- CORS rejected `127.0.0.1:5173`.
  - Allowed `localhost`, `127.0.0.1`, and comma-separated `CLIENT_URL` origins.

- Timetable live status did not properly parse AM/PM times.
  - Updated time parsing and current-class detection.

- Teacher status validation rejected newer statuses.
  - Allowed `Available`, `Busy`, `In Class`, `On Leave`, `In Meeting`, and `Not Updated`.

- Teacher status update did not persist as a manual override.
  - Updated `/api/teacher/status` to store manual status, location, and available time.

- Faculty search status filtering could return incorrect totals.
  - Live status is now calculated before status filtering and pagination.

- Frontend service layer hid backend failures by silently returning local fallback faculty.
  - Removed silent fallback from `facultyService`.

- Appointment booking was local-only.
  - Appointment requests now call the backend request API.

- Teacher dashboard interactions were local-only.
  - Dashboard load, status update, request accept/reject, slot create, and slot delete now call backend services.

- Admin dashboard showed static-only counts.
  - Admin dashboard now loads backend analytics and falls back only for display continuity.

- In-app back navigation was missing or too subtle.
  - Added reusable Back button, global back navigation, dashboard section history, modal back support, and scroll restoration.

- Environment example files were missing from the actual workspace.
  - Added root `.env.example` and backend `.env.example` with safe placeholders.

## Files Changed

- `backend/server.js`
- `backend/.env.example`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/facultyController.js`
- `backend/src/controllers/teacherController.js`
- `backend/src/models/PendingRegistration.js`
- `backend/src/models/User.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/teacherRoutes.js`
- `backend/src/routes/testEmailRoutes.js`
- `backend/src/utils/liveStatus.js`
- `backend/src/utils/sendEmail.js`
- `.env.example`
- `src/App.jsx`
- `src/context/AuthContext.jsx`
- `src/pages/Auth.jsx`
- `src/pages/VerifyOtp.jsx`
- `src/pages/StudentDashboard.jsx`
- `src/pages/TeacherDashboard.jsx`
- `src/pages/AdminDashboard.jsx`
- `src/pages/SmartCampus.jsx`
- `src/components/AppointmentBookingModal.jsx`
- `src/components/common/BackButton.jsx`
- `src/components/common/GlobalBackNavigation.jsx`
- `src/components/common/ScrollRestoration.jsx`
- `src/services/api.js`
- `src/services/facultyService.js`
- `src/services/teacherService.js`
- `src/services/requestService.js`
- `src/services/notificationService.js`

## Verification Performed

- Frontend `npm run build`: passed.
- Backend `node --check server.js`: passed.
- Backend syntax check for `backend/src/**/*.js`: passed.
- Backend `GET /api/health`: passed on running server.
- Backend `npm install`: passed.

## Remaining Warnings

- Frontend `npm install` timed out in the sandbox, but existing dependencies are installed and the production build passes.
- Vite reports a large bundle warning. This is not a build failure; future optimization should code-split Recharts, Fuse, and dashboard modules.
- Full end-to-end OTP email delivery still depends on real SMTP credentials in `backend/.env`.
- Full database integration tests require a reachable MongoDB instance with imported campus data.
