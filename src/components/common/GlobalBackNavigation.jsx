import { useLocation } from "react-router-dom";
import { dashboardForRole, useAuth } from "../../context/AuthContext";
import { BackButton } from "./BackButton";

function fallbackFor(pathname, role) {
  if (pathname.startsWith("/student")) return "/student-dashboard";
  if (pathname.startsWith("/teacher")) return "/teacher-dashboard";
  if (pathname.startsWith("/admin")) return "/admin-dashboard";
  if (role) return dashboardForRole(role);
  return "/";
}

export function GlobalBackNavigation() {
  const { pathname } = useLocation();
  const { role } = useAuth();

  if (pathname === "/") return null;

  const isDashboard = pathname.includes("dashboard");

  return (
    <div className={`fixed top-24 z-[70] ${isDashboard ? "left-4 lg:left-80" : "left-4"}`}>
      <BackButton
        fallbackRoute={fallbackFor(pathname, role)}
        className="border-cyan/45 bg-night/90 px-5 py-2.5"
      />
    </div>
  );
}
