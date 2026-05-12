const names = [
  "Aarav Raman", "Mira Iyer", "Kabir Menon", "Ananya Rao", "Dev Mehta", "Sara Nair", "Rohan Kapoor", "Ishita Sen",
  "Vikram Das", "Priya Kulkarni", "Neel Shah", "Zoya Khan", "Arjun Bhat", "Leela Thomas", "Nikhil Jain", "Tara George",
  "Karthik Reddy", "Maya Pillai", "Vihaan Bose", "Rhea Mathew", "Aditya Varma", "Diya Krishnan", "Sameer Joshi", "Nisha Roy",
  "Rahul Sinha", "Aisha Qureshi", "Ishan Chandra", "Meera Saxena", "Varun Gupta", "Tanvi Balan", "Siddharth Nair", "Avni Desai",
  "Yash Malhotra", "Kavya Prasad", "Harish Kumar", "Noor Ali", "Manav Arora", "Sneha Patil", "Akash Verma", "Pooja Mishra",
  "Rehan Sheikh", "Aditi Ghosh", "Naveen Rao", "Farah Khan", "Gaurav Singh", "Lavanya Murthy", "Joel Dsouza", "Meghna Batra",
  "Sahil Chopra", "Ritika Anand"
];

const departments = ["CSE", "ECE", "EEE", "IT", "AIML", "DS", "Civil", "Mechanical"];
const statuses = ["Available", "Busy", "In Class", "On Leave"];
const designations = ["Professor", "Associate Professor", "Assistant Professor", "Senior Lecturer"];
const subjects = {
  CSE: ["Data Structures", "Algorithms", "Operating Systems"],
  ECE: ["VLSI", "Signals", "Embedded Systems"],
  EEE: ["Power Systems", "Control Systems", "Machines"],
  IT: ["Web Engineering", "Cyber Security", "DevOps"],
  AIML: ["Machine Learning", "Deep Learning", "NLP"],
  DS: ["Statistics", "Data Mining", "Big Data"],
  Civil: ["Structures", "Surveying", "Hydraulics"],
  Mechanical: ["Thermodynamics", "CAD", "Manufacturing"],
};

export function makeFacultyProfiles(teacherUsers = []) {
  return names.map((name, index) => {
    const department = departments[index % departments.length];
    const teacher = teacherUsers[index];
    return {
      user: teacher?._id,
      name: `Dr. ${name}`,
      email: teacher?.email || `${name.toLowerCase().replaceAll(" ", ".")}@campus.edu`,
      phone: `98765${(43210 + index).toString().slice(0, 5)}`,
      department,
      designation: designations[index % designations.length],
      cabin: `Block-${String.fromCharCode(65 + (index % 6))}-${101 + index}`,
      location: index % 5 === 0 ? "CSE Staff Room" : `Block ${String.fromCharCode(65 + (index % 6))}`,
      subjects: subjects[department],
      experience: 5 + (index % 18),
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
      status: statuses[index % statuses.length],
      availableTime: `${9 + (index % 4)}:30 AM - ${1 + (index % 5)}:00 PM`,
      isVerified: true,
      isActive: true,
    };
  });
}
