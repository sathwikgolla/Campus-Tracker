import { motion } from "framer-motion";
import { ArrowRight, Bell, Filter, Heart, Map, MapPin, MessageSquare, Network, Search, Sparkles, UsersRound, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardPreview } from "../components/DashboardWidgets";
import { FacultySearch } from "../components/FacultySearch";
import { HeroPreview } from "../components/HeroPreview";
import { Navbar } from "../components/Navbar";
import { Section } from "../components/Section";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const stats = [["250+", "Faculty Members"], ["20+", "Departments"], ["1000+", "Students Helped"], ["Real-time", "Availability Updates"]];
const features = [
  ["Real-time Faculty Status", Zap], ["Smart Search", Search], ["Department Filters", Filter], ["Teacher Availability Updates", UsersRound],
  ["Role-based Dashboards", Network], ["Notifications", Bell], ["Favorites", Heart], ["Campus Analytics", Sparkles],
];
const testimonials = [
  ["Nila S, CSE", "CampusTracker saved so much time during project reviews."],
  ["Arjun M, ECE", "The live availability cards feel like the campus finally has a control center."],
  ["Diya R, AIML", "Finding the right faculty member before lab sessions is effortless now."],
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Navbar />
      <main className="overflow-hidden pt-28">
        <Section className="pb-14 pt-10 lg:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan">
                <Sparkles className="h-4 w-4" /> NEW · AI-powered Faculty Tracking
              </div>
              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Find Faculty.<br /><span className="aurora-text">Anywhere on Campus.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slateText">
                CampusTracker helps students instantly locate faculty members, check availability, cabin locations, schedules, and connect smarter inside campus.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#search"><Button className="h-13">Search Faculty <Search className="h-4 w-4" /></Button></a>
                <a href="#dashboards"><Button variant="secondary" className="h-13">View Dashboard <ArrowRight className="h-4 w-4" /></Button></a>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-sm text-slateText">
                {["Real-time updates", "Smart filtering", "Role-based dashboards"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">{item}</span>
                ))}
              </div>
            </motion.div>
            <HeroPreview />
          </div>
        </Section>

        {isAuthenticated && (
          <Section className="py-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <Card key={label} className="p-6 text-center">
                  <div className="text-3xl font-black aurora-text">{value}</div>
                  <div className="mt-2 text-sm text-slateText">{label}</div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        <Section id="about" className="py-16">
          <div className="glass rounded-3xl p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">About</p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Campus coordination without the usual friction</h2>
              </div>
              <p className="text-base leading-8 text-slateText">
                CampusTracker brings faculty availability, cabin location, department context, and role-based workflows into a single secure campus platform. Public visitors can learn how it works, while live search and operational dashboards stay protected behind login.
              </p>
            </div>
          </div>
        </Section>

        <Section className="py-20"><FacultySearch /></Section>

        <Section className="py-20">
          <div className="glass rounded-3xl p-8 sm:p-10">
            <h2 className="text-center text-3xl font-black text-white sm:text-4xl">How <span className="aurora-text">CampusTracker</span> Works</h2>
            <div className="relative mt-12 grid gap-8 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-14 hidden border-t border-dashed border-cyan/30 md:block" />
              {[["Search Faculty", Search, "Find faculty by name, department, or keyword."], ["Locate Availability", MapPin, "Get cabin location, timings, and status."], ["Connect Easily", MessageSquare, "Reach out or visit them at the right time."]].map(([title, Icon, text], i) => (
                <motion.div key={title} whileHover={{ y: -8 }} className="relative text-center">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl border border-cyan/25 bg-cyan/10 shadow-cyanGlow"><Icon className="h-9 w-9 text-white" /></div>
                  <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slateText">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="features" className="py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">Features</p>
              <h2 className="mt-3 text-4xl font-black text-white">Built for a smarter campus</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, Icon], index) => (
              <Card key={title} className="p-6">
                <motion.div whileHover={{ rotate: 12 }} className="grid h-14 w-14 place-items-center rounded-3xl border border-violetSoft/25 bg-violet/15 shadow-glow">
                  <Icon className="h-6 w-6 text-cyan" />
                </motion.div>
                <h3 className="mt-5 text-base font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slateText">A polished workflow surface designed for repeated campus coordination.</p>
              </Card>
            ))}
          </div>
        </Section>

        {isAuthenticated && (
          <Section id="dashboards" className="py-20">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">Dashboard Preview</p>
              <h2 className="mt-3 text-4xl font-black text-white">One command center for every role</h2>
            </div>
            <DashboardPreview />
          </Section>
        )}

        {isAuthenticated && (
          <Section className="py-20">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] py-5">
              <div className="marquee flex w-[200%] gap-4 px-4">
                {[...testimonials, ...testimonials].map(([name, quote], index) => (
                  <Card key={`${name}-${index}`} className="w-[360px] shrink-0 p-6">
                    <div className="mb-5 h-12 w-12 rounded-2xl bg-gradient-to-br from-violet to-cyan" />
                    <p className="text-sm leading-7 text-slateText">"{quote}"</p>
                    <p className="mt-5 font-bold text-white">{name}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Section>
        )}

        <footer id="contact" className="border-t border-white/10 bg-panel/50">
          <Section className="py-12">
            <div className="grid gap-8 md:grid-cols-4">
              {["Quick Links", "Resources", "Contact", "Socials"].map((title) => (
                <div key={title}>
                  <h4 className="font-bold text-white">{title}</h4>
                  <div className="mt-4 grid gap-3 text-sm text-slateText">
                    {title === "Contact" ? ["support@campustracker.edu", "+91 98765 43210", "Campus City, CT 12345"].map((x) => <span key={x}>{x}</span>) : ["Home", "Features", "Dashboards", "Help Center"].map((x) => <span key={x}>{x}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-muted">© 2026 CampusTracker.</div>
          </Section>
        </footer>
      </main>
    </>
  );
}
