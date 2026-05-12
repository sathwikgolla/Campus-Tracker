import dotenv from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import Favorite from "../models/Favorite.js";
import Notification from "../models/Notification.js";
import RecentSearch from "../models/RecentSearch.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/campusData.json");

function safeEmail(teacher, index) {
  return teacher.email || `${teacher.name || `teacher${index + 1}`}`.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") + "@campus.local";
}

function normalizeTeacher(teacher, index) {
  if (!teacher.name) console.warn(`Warning: teacher ${index + 1} missing name`);
  return {
    name: teacher.name || `Teacher ${index + 1}`,
    email: safeEmail(teacher, index).toLowerCase(),
    password: crypto.randomBytes(18).toString("hex"),
    role: "teacher",
    department: teacher.department || teacher.departmentBranch || "Unassigned",
    designation: teacher.designation || "Faculty",
    cabin: teacher.cabin || "Cabin not assigned",
    phone: teacher.phone || "",
    subjects: Array.isArray(teacher.subjects) ? teacher.subjects : teacher.subject ? [teacher.subject] : [],
    employeeId: teacher.employeeId || `JSON-${String(index + 1).padStart(4, "0")}`,
  };
}

async function run() {
  await connectDB();
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const teachers = raw.teachers || raw.faculty || [];
  const timetable = raw.timetable || raw.timetableEntries || raw.classes || [];
  let skipped = 0;

  await Promise.all([
    User.deleteMany({}),
    FacultyProfile.deleteMany({}),
    Department.deleteMany({}),
    Timetable.deleteMany({}),
    Notification.deleteMany({}),
    Favorite.deleteMany({}),
    RecentSearch.deleteMany({}),
  ]);

  const normalizedTeachers = teachers.map(normalizeTeacher);
  const users = [];
  for (const teacher of normalizedTeachers) {
    const exists = users.some((user) => user.email === teacher.email);
    if (exists) {
      skipped += 1;
      continue;
    }
    users.push(await User.create(teacher));
  }

  const userByName = new Map(users.map((user) => [user.name.toLowerCase(), user]));
  const profiles = [];
  for (const user of users) {
    profiles.push(await FacultyProfile.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      designation: user.designation,
      cabin: user.cabin,
      location: user.cabin,
      currentLocation: user.cabin,
      subjects: user.subjects,
      status: "Not Updated",
      availableTime: "Not updated",
      isVerified: true,
      isActive: true,
    }));
  }

  const departmentCodes = new Set([
    ...users.map((user) => user.department).filter(Boolean),
    ...timetable.map((entry) => entry.department || entry.departmentBranch || entry.branch).filter(Boolean),
  ]);
  const departments = await Department.insertMany([...departmentCodes].map((code) => ({
    name: code,
    code,
    block: code.includes("CSE") ? "Block A" : "Main Block",
    hod: users.find((user) => user.department === code && /hod/i.test(user.designation || ""))?.name || "",
    totalFaculty: users.filter((user) => user.department === code).length,
    isActive: true,
  })));

  const entries = [];
  for (const [index, entry] of timetable.entries()) {
    const teacherName = entry.teacherName || entry.teacher || entry.facultyName || "";
    const user = userByName.get(String(teacherName).toLowerCase());
    if (!teacherName || !user) {
      skipped += 1;
      console.warn(`Warning: timetable entry ${index + 1} skipped, teacher not found: ${teacherName || "missing"}`);
      continue;
    }
    entries.push({
      teacher: user._id,
      teacherId: user._id,
      teacherName: user.name,
      ownerRole: "teacher",
      subject: entry.subject || "Subject not assigned",
      department: entry.department || entry.departmentBranch || user.department,
      branch: entry.branch || entry.departmentBranch || user.department,
      year: entry.year || "",
      section: entry.section || "",
      day: entry.day || "",
      period: String(entry.period || ""),
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      room: entry.room || "Room not assigned",
    });
  }
  await Timetable.insertMany(entries);

  console.log(`Total teachers imported: ${users.length}`);
  console.log(`Total timetable entries imported: ${entries.length}`);
  console.log(`Total departments imported: ${departments.length}`);
  console.log(`Skipped duplicate records: ${skipped}`);
  console.log("Import completed successfully");
  await mongoose.connection.close();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  });
}
