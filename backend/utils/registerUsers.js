const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import Models
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Course = require("../models/Course");
const TeacherCourses = require("../models/TeacherCourses");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

async function resetDatabase() {
    try {
        console.log("⚠️ Deleting existing data...");
        await Teacher.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});
        await TeacherCourses.deleteMany({});
        console.log("✅ All previous data deleted.");
    } catch (err) {
        console.error("❌ Error deleting data:", err);
    }
}

async function registerUsers() {
    try {
        await resetDatabase(); // Delete existing data before inserting new data

        // Hash passwords before inserting
        const teacherPassword = await bcrypt.hash("teacher123", 10);
        const studentPassword = await bcrypt.hash("student123", 10);

        // Insert Teachers
        const teachers = await Teacher.create([
            { name: "John Doe", email: "johndoe@example.com", password: teacherPassword, subject: "OOP" },
            { name: "Alice Johnson", email: "alice@example.com", password: teacherPassword, subject: "DSA" }
        ]);

        // Insert Students
        const students = await Student.create([
            { name: "Jane Smith", email: "janesmith@example.com", password: studentPassword, rollNumber: "22CS1001", class: "OOP-CS-A" },
            { name: "Robert Brown", email: "robert@example.com", password: studentPassword, rollNumber: "22CS1002", class: "OOP-CS-A" }
        ]);

        // Insert Courses with Naming Convention
        const courses = await Course.create([
            { courseName: "OOP", department: "CS", section: "A", courseCode: "OOP-CS-A", enrolledStudents: [students[0]._id, students[1]._id] },
            { courseName: "OOP", department: "CS", section: "B", courseCode: "OOP-CS-B", enrolledStudents: [] },
            { courseName: "OOP", department: "CS", section: "C", courseCode: "OOP-CS-C", enrolledStudents: [] },
            { courseName: "OOP", department: "SE", section: "A", courseCode: "OOP-SE-A", enrolledStudents: [] },
            { courseName: "OOP", department: "SE", section: "B", courseCode: "OOP-SE-B", enrolledStudents: [] }
        ]);

        // Assign Courses to Teachers in `TeacherCourses`
        await TeacherCourses.create([
            { teacherId: teachers[0]._id, courseId: courses[0]._id }, // John Doe -> OOP-CS-A
            { teacherId: teachers[0]._id, courseId: courses[1]._id }, // John Doe -> OOP-CS-B
            { teacherId: teachers[1]._id, courseId: courses[2]._id }, // Alice Johnson -> OOP-CS-C
            { teacherId: teachers[1]._id, courseId: courses[3]._id }  // Alice Johnson -> OOP-SE-A
        ]);

        // Add Attendance Records for Students in OOP-CS-A
        const Attendance = require("../models/Attendance"); // Import the Attendance model
        const courseId = courses[0].courseCode; // OOP-CS-A
        const teacherId = teachers[0]._id; // John Doe
        const sessionDate = new Date().toISOString().split('T')[0]; // Today's date
        const classSessionId = `${courseId}-${sessionDate}`;

        // Add Attendance Records for Students in OOP-CS-A
        const courseCode = courses[0].courseCode; // Use courseCode instead of courseId

        // Create attendance records for each student in OOP-CS-A
        const attendanceRecords = await Attendance.create([
            {
                studentId: students[0]._id, // Jane Smith
                teacherId: teacherId,
                classSessionId: classSessionId,
                status: "P", // Present
                date: sessionDate
            },
            {
                studentId: students[1]._id, // Robert Brown
                teacherId: teacherId,
                classSessionId: classSessionId,
                status: "A", // Absent
                date: sessionDate
            }
        ]);

        console.log("✅ Attendance records created:", attendanceRecords);
        console.log("✅ Teachers, Students, Courses, and Attendance records registered successfully!");
        return true; // Return success
    } catch (err) {
        console.error("❌ Error registering data:", err);
        return false; // Return failure
    }
}

async function viewAssignments() {
    try {
        // Get all teachers with their details
        const teachers = await Teacher.find();
        
        console.log("\n🧑‍🏫 TEACHER-COURSE ASSIGNMENTS 🧑‍🏫");
        console.log("======================================");
        
        // For each teacher, find their assigned courses
        for (const teacher of teachers) {
            console.log(`\nTeacher: ${teacher.name} (${teacher.email}) - Subject: ${teacher.subject}`);
            console.log("Assigned Courses:");
            
            const teacherCourses = await TeacherCourses.find({ teacherId: teacher._id }).populate("courseId");
            
            if (teacherCourses.length === 0) {
                console.log("   No courses assigned");
                continue;
            }
            
            // Display each course assigned to this teacher
            for (const tc of teacherCourses) {
                const course = tc.courseId;
                console.log(`   - ${course.courseName} (${course.courseCode}), Department: ${course.department}, Section: ${course.section}`);
                
                // Find students in this course (matching by class and courseCode)
                const students = await Student.find({ class: course.courseCode });
                
                console.log(`     Students in this course (${students.length}):`);
                if (students.length === 0) {
                    console.log("       No students enrolled");
                } else {
                    students.forEach(student => {
                        console.log(`       • ${student.name} (${student.rollNumber}) - ${student.email}`);
                    });
                }
            }
            console.log("--------------------------------------");
        }
        
        // Summary statistics
        const totalTeachers = await Teacher.countDocuments();
        const totalStudents = await Student.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalAssignments = await TeacherCourses.countDocuments();
        
        console.log("\n📊 SUMMARY STATISTICS 📊");
        console.log("========================");
        console.log(`Total Teachers: ${totalTeachers}`);
        console.log(`Total Students: ${totalStudents}`);
        console.log(`Total Courses: ${totalCourses}`);
        console.log(`Total Course Assignments: ${totalAssignments}`);
        
    } catch (err) {
        console.error("❌ Error retrieving assignments:", err);
    }
}

// Main function to run both operations
async function main() {
    try {
        const registered = await registerUsers();
        if (registered) {
            await viewAssignments();
        }
    } catch (err) {
        console.error("❌ Error in main process:", err);
    } finally {
        // Disconnect only at the very end
        mongoose.disconnect();
        console.log("\n✅ Database connection closed");
    }
}

// Run the main function
main();