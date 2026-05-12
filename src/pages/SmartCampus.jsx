import { AnalyticsCharts } from "../components/AnalyticsCharts";
import { AttendancePanel } from "../components/AttendancePanel";
import { CampusMap } from "../components/CampusMap";
import { DiscussionForum } from "../components/DiscussionForum";
import { EventsPage } from "../components/EventsPage";
import { FacultySmartSearch } from "../components/FacultySmartSearch";
import { NotificationCenter } from "../components/NotificationCenter";
import { ThemeSelector } from "../components/ThemeSelector";
import { TimetableView } from "../components/TimetableView";
import { Navbar } from "../components/Navbar";
import { Section } from "../components/Section";
import { BackButton } from "../components/common/BackButton";

export function CampusMapPage() {
  return <><Navbar /><main className="pt-28"><Section className="py-10"><div className="mb-6 flex flex-wrap items-center gap-4"><BackButton fallbackRoute="/student-dashboard" /><h1 className="text-4xl font-black text-white">Interactive Campus Map</h1></div><CampusMap /></Section></main></>;
}

export function EventsRoutePage() {
  return <><Navbar /><main className="pt-28"><Section className="py-10"><div className="mb-6 flex flex-wrap items-center gap-4"><BackButton fallbackRoute="/student-dashboard" /><h1 className="text-4xl font-black text-white">Campus Events</h1></div><EventsPage /></Section></main></>;
}

export function ForumRoutePage() {
  return <><Navbar /><main className="pt-28"><Section className="py-10"><div className="mb-6 flex flex-wrap items-center gap-4"><BackButton fallbackRoute="/student-dashboard" /><h1 className="text-4xl font-black text-white">Student Discussion Forum</h1></div><DiscussionForum /></Section></main></>;
}

export function SmartCampusPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <Section className="grid gap-10 py-10">
          <div><BackButton fallbackRoute="/student-dashboard" /><p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-cyan">Smart Campus OS</p><h1 className="mt-2 text-4xl font-black text-white">Advanced CampusTracker Modules</h1></div>
          <FacultySmartSearch />
          <CampusMap />
          <NotificationCenter />
          <AnalyticsCharts />
          <TimetableView />
          <AttendancePanel />
          <ThemeSelector />
          <EventsPage />
          <DiscussionForum />
        </Section>
      </main>
    </>
  );
}
