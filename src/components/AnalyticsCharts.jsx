import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { faculty } from "../data/faculty";
import { Card } from "./ui/Card";

const statusData = Object.entries(faculty.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})).map(([name, value]) => ({ name, value }));
const deptData = Object.entries(faculty.reduce((acc, item) => ({ ...acc, [item.department]: (acc[item.department] || 0) + 1 }), {})).map(([name, count]) => ({ name, count }));
const trend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => ({ day, searches: 18 + i * 7, appointments: 5 + i * 3 }));
const colors = ["#06B6D4", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444"];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="h-80 p-5"><h3 className="mb-4 font-bold text-white">Department Faculty</h3><ResponsiveContainer><BarChart data={deptData}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="name" stroke="#94A3B8" /><YAxis stroke="#94A3B8" /><Tooltip /><Bar dataKey="count" fill="#06B6D4" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card className="h-80 p-5"><h3 className="mb-4 font-bold text-white">Status Distribution</h3><ResponsiveContainer><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60}>{statusData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Card>
      <Card className="h-80 p-5"><h3 className="mb-4 font-bold text-white">Search Trend</h3><ResponsiveContainer><LineChart data={trend}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="day" stroke="#94A3B8" /><YAxis stroke="#94A3B8" /><Tooltip /><Line dataKey="searches" stroke="#8B5CF6" strokeWidth={3} /></LineChart></ResponsiveContainer></Card>
      <Card className="h-80 p-5"><h3 className="mb-4 font-bold text-white">Appointment Trend</h3><ResponsiveContainer><AreaChart data={trend}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="day" stroke="#94A3B8" /><YAxis stroke="#94A3B8" /><Tooltip /><Area dataKey="appointments" stroke="#06B6D4" fill="#06B6D433" /></AreaChart></ResponsiveContainer></Card>
    </div>
  );
}
