const Teacher = require("../models/Teacher");
const TeacherCourses = require("../models/TeacherCourses");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");

exports.registerTeacher = async (req, res) => {
    try {
        const { name, email, password, subject } = req.body;
        
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = new Teacher({ name, email, password: hashedPassword, subject });
        await teacher.save();

        res.status(201).json({ message: "Teacher registered successfully!", teacher });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignCourses = async (req, res) => {
    try {
        const { teacherId, courseIds } = req.body;
        const teacher = await Teacher.findByIdAndUpdate(
            teacherId,
            { assignedCourses: courseIds },
            { new: true }
        ).populate("assignedCourses");
        res.status(200).json({ message: "Courses assigned successfully!", teacher });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTeacherCourses = async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        console.log("Getting courses for teacherId:", teacherId);
        
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });
        }
        
        // Get assigned courses for this teacher
        const teacherCourses = await TeacherCourses.find({ teacherId }).populate("courseId");
        console.log("Found teacher courses:", teacherCourses);
        
        if (!teacherCourses || !teacherCourses.length) {
            console.log("No courses found for teacher:", teacherId);
            return res.status(200).json([]); // Return empty array instead of 404
        }
        
        // Transform the data to a format expected by the frontend
        const courses = teacherCourses.map(tc => {
            // Make sure we have a valid courseId object
            if (!tc.courseId) {
                console.log("Missing courseId for teacher course:", tc);
                return null;
            }
            
            return {
                _id: tc.courseId._id.toString(), // Convert ObjectId to string
                courseCode: tc.courseId.courseCode || "Unknown Course",
                courseName: tc.courseId.courseName || tc.courseId.name || "",
                department: tc.courseId.department || "",
                section: tc.courseId.section || ""
            };
        }).filter(Boolean); // Remove any null values
        
        console.log("Sending courses to frontend:", courses);
        
        res.status(200).json(courses);
    } catch (err) {
        console.error("Error fetching teacher courses:", err);
        res.status(500).json({ error: err.message });
    }
};