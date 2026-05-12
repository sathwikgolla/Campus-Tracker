import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { EmergencyBanner } from "./components/EmergencyBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RealtimeLayer } from "./components/RealtimeLayer";
import { GlobalBackNavigation } from "./components/common/GlobalBackNavigation";
import { ScrollRestoration } from "./components/common/ScrollRestoration";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import { CampusMapPage, EventsRoutePage, ForumRoutePage, SmartCampusPage } from "./pages/SmartCampus";
import TeacherDashboard from "./pages/TeacherDashboard";
import VerifyOtp from "./pages/VerifyOtp";

function Page({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.45 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <AnimatedBackground />
      <ScrollRestoration />
      <GlobalBackNavigation />
      <RealtimeLayer />
      <EmergencyBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/auth" element={<Page><Auth /></Page>} />
          <Route path="/verify-otp" element={<Page><VerifyOtp /></Page>} />
          <Route path="/student-dashboard" element={<Page><ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute></Page>} />
          <Route path="/teacher-dashboard" element={<Page><ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute></Page>} />
          <Route path="/admin-dashboard" element={<Page><ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute></Page>} />
          <Route path="/smart-campus" element={<Page><ProtectedRoute><SmartCampusPage /></ProtectedRoute></Page>} />
          <Route path="/campus-map" element={<Page><ProtectedRoute><CampusMapPage /></ProtectedRoute></Page>} />
          <Route path="/events" element={<Page><ProtectedRoute><EventsRoutePage /></ProtectedRoute></Page>} />
          <Route path="/forum" element={<Page><ProtectedRoute><ForumRoutePage /></ProtectedRoute></Page>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
