function minutes(value = "") {
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const mins = Number(match[2] || 0);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export function getFacultyLiveStatus(teacher, timetableEntries = [], now = new Date()) {
  if (teacher?.manualStatus) {
    return {
      status: teacher.manualStatus,
      location: teacher.manualLocation || teacher.currentLocation || teacher.cabin || "Cabin not assigned",
      subject: null,
      availableTime: teacher.manualAvailableTime || teacher.availableTime || "Not updated",
    };
  }

  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const current = now.getHours() * 60 + now.getMinutes();
  const currentClass = timetableEntries.find((entry) => {
    if (entry.day !== day) return false;
    const start = minutes(entry.startTime);
    const end = minutes(entry.endTime);
    return start !== null && end !== null && current >= start && current < end;
  });

  if (currentClass) {
    return {
      status: "In Class",
      location: currentClass.room || "Room not assigned",
      subject: currentClass.subject,
      availableTime: `After ${currentClass.endTime}`,
    };
  }

  return {
    status: "Available",
    location: teacher?.cabin || "Cabin not assigned",
    subject: null,
    availableTime: "Available now",
  };
}
