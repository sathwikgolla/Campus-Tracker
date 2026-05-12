import dotenv from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/additional_50_faculty.json");

function safeEmail(teacher, index) {
  return (teacher.email || `${teacher.name || `additional-teacher-${index + 1}`}`.toLowerCase().replace(/[^a-z0-9]+/g, ".") + "@campus.local").toLowerCase();
}

function normalizeTeacher(teacher, index) {
  return {
    name: teacher.name || `Additional Teacher ${index + 1}`,
    email: safeEmail(teacher, index),
    password: crypto.randomBytes(18).toString("hex"),
    role: "teacher",
    department: teacher.department || teacher.departmentBranch || "Unassigned",
    designation: teacher.designation || "Faculty",
    cabin: teacher.cabin || "Cabin not assigned",
    phone: teacher.phone || "",
    subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
    employeeId: teacher.employeeId || teacher.teacherId || `ADD-${String(index + 1).padStart(4, "0")}`,
  };
}

async function findExistingTeacher(teacher) {
  const clauses = [];
  if (teacher.email) clauses.push({ email: teacher.email });
  if (teacher.employeeId) clauses.push({ employeeId: teacher.employeeId });
  if (!clauses.length) return null;
  return User.findOne({ role: "teacher", $or: clauses });
}

async function run() {
  await connectDB();
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const teachers = Array.isArray(raw) ? raw : raw.teachers || raw.faculty || [];
  const timetable = raw.timetable || raw.timetableEntries || raw.classes || [];

  let createdTeachers = 0;
  let updatedTeachers = 0;
  let skippedDuplicates = 0;
  let timetableImported = 0;
  let timetableSkipped = 0;

  for (const [index, source] of teachers.entries()) {
    const teacher = normalizeTeacher(source, index);
    const existing = await findExistingTeacher(teacher);
    const user = existing
      ? await User.findByIdAndUpdate(existing._id, { ...teacher, password: existing.password }, { new: true })
      : await User.create(teacher);

    if (existing) {
      updatedTeachers += 1;
      skippedDuplicates += 1;
    } else {
      createdTeachers += 1;
    }

    await FacultyProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        cabin: user.cabin || "Cabin not assigned",
        location: user.cabin || "Cabin not assigned",
        currentLocation: user.cabin || "Cabin not assigned",
        subjects: user.subjects,
        status: "Not Updated",
        availableTime: "No timetable available",
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Department.findOneAndUpdate(
      { code: user.department },
      { name: user.department, code: user.department, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const allTeachers = await User.find({ role: "teacher" });
  const teacherByName = new Map(allTeachers.map((user) => [user.name.toLowerCase(), user]));

  for (const [index, entry] of timetable.entries()) {
    const teacherName = entry.teacherName || entry.teacher || entry.facultyName || "";
    const user = teacherByName.get(String(teacherName).toLowerCase());
    if (!user) {
      timetableSkipped += 1;
      console.warn(`Warning: timetable entry ${index + 1} skipped, teacher not found: ${teacherName || "missing"}`);
      continue;
    }
    const fingerprint = {
      teacherId: user._id,
      day: entry.day || "",
      period: String(entry.period || ""),
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      subject: entry.subject || "Subject not assigned",
      room: entry.room || "Room not assigned",
    };
    const exists = await Timetable.findOne(fingerprint);
    if (exists) {
      timetableSkipped += 1;
      continue;
    }
    await Timetable.create({
      ...fingerprint,
      teacher: user._id,
      teacherName: user.name,
      ownerRole: "teacher",
      department: entry.department || entry.departmentBranch || user.department,
      branch: entry.branch || entry.departmentBranch || user.department,
      year: entry.year || "",
      section: entry.section || "",
    });
    timetableImported += 1;
  }

  for (const department of await Department.find()) {
    department.totalFaculty = await User.countDocuments({ role: "teacher", department: department.code });
    await department.save();
  }

  console.log(`New teachers imported: ${createdTeachers}`);
  console.log(`Existing teachers updated: ${updatedTeachers}`);
  console.log(`Timetable entries imported: ${timetableImported}`);
  console.log(`Departments available: ${await Department.countDocuments()}`);
  console.log(`Skipped duplicate records: ${skippedDuplicates + timetableSkipped}`);
  console.log("Additional teacher import completed successfully");
  await mongoose.connection.close();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch(async (error) => {
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  });
}
