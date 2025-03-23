const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Course = require("../models/Course");

// Add attendance for a student already enrolled in a course
exports.addAttendanceForStudent = async (req, res) => {
    try {
        const { studentId, courseId, status, date } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !status) {
            return res.status(400).json({ message: "Missing required fields: studentId, courseId, or status" });
        }

        // Validate status
        if (!["P", "A", "L"].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be P, A, or L" });
        }

        // Extract teacherId from session or token (assuming it's available in req.user)
        const teacherId = req.user ? req.user.id : req.body.teacherId;

        if (!teacherId) {
            return res.status(401).json({ message: "Teacher ID is required" });
        }

        // Check if the student is enrolled in the course
        const course = await Course.findById(courseId).populate("enrolledStudents");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isStudentEnrolled = course.enrolledStudents.some(student => student._id.toString() === studentId);
        if (!isStudentEnrolled) {
            return res.status(400).json({ message: "Student is not enrolled in this course" });
        }

        // Create a unique classSessionId using courseId and date
        const sessionDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const classSessionId = `${courseId}-${sessionDate}`;

        // Check if attendance record already exists for this student and session
        const existingRecord = await Attendance.findOne({
            studentId,
            classSessionId,
        });

        if (existingRecord) {
            return res.status(400).json({ message: "Attendance record already exists for this student and session" });
        }

        // Create new attendance record
        const newAttendance = new Attendance({
            studentId,
            teacherId,
            classSessionId,
            status,
            date: sessionDate,
        });

        await newAttendance.save();

        res.status(201).json({
            message: "Attendance record created successfully",
            attendance: newAttendance,
        });
    } catch (err) {
        console.error("Error adding attendance:", err);
        res.status(500).json({ error: err.message });
    }
};
// Get all attendance records for a course
exports.getAttendance = async (req, res) => {
    try {
        const { courseCode } = req.params; // Use courseCode
        console.log(`Fetching attendance for courseCode: ${courseCode}`);

        if (!courseCode) {
            return res.status(400).json({ message: "Course Code is required" });
        }

        // Find the course to get enrolled students
        const course = await Course.findOne({ courseCode }).populate("enrolledStudents");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Fetch all attendance records for the course
        const attendanceRecords = await Attendance.find({
            classSessionId: { $regex: new RegExp(`^${courseCode}-`) } // Match courseCode in classSessionId
        }).populate("studentId", "name rollNumber");

        console.log(`Found ${attendanceRecords.length} records for courseCode: ${courseCode}`);

        // Transform the data into the format expected by the frontend
        const attendanceData = course.enrolledStudents.map(student => {
            const studentAttendance = {};
            attendanceRecords.forEach(record => {
                if (record.studentId._id.toString() === student._id.toString()) {
                    // Ensure the date is a valid Date object
                    let date;
                    if (record.date instanceof Date) {
                        date = record.date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
                    } else if (typeof record.date === 'string') {
                        // If date is stored as a string, convert it to a Date object
                        date = new Date(record.date).toISOString().split("T")[0];
                    } else {
                        console.warn("Invalid date format for record:", record);
                        return;
                    }
                    studentAttendance[date] = record.status;
                }
            });

            return {
                studentId: student._id,
                studentName: student.name,
                rollNumber: student.rollNumber,
                attendance: studentAttendance
            };
        });

        res.status(200).json(attendanceData);
    } catch (err) {
        console.error("Error fetching attendance:", err);
        res.status(500).json({ error: err.message });
    }
};
// Update existing attendance record
exports.updateAttendance = async (req, res) => {
    try {
        const { studentId, classSessionId, date, status } = req.body;
        
        if (!studentId || !classSessionId || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Check if the status is valid
        if (!['P', 'A', 'L'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be P, A, or L" });
        }
        
        // Extract teacherId from session or token
        const teacherId = req.user ? req.user.id : req.body.teacherId;
        
        if (!teacherId) {
            return res.status(401).json({ message: "Teacher ID required" });
        }
        
        // Find existing record
        let attendanceRecord = await Attendance.findOne({
            studentId,
            classSessionId
        });
        
        if (attendanceRecord) {
            // Update existing record
            attendanceRecord.status = status;
            await attendanceRecord.save();
        } else {
            // Create new record if it doesn't exist
            attendanceRecord = new Attendance({
                studentId,
                teacherId,
                classSessionId,
                status,
                date: date ? new Date(date) : new Date()
            });
            await attendanceRecord.save();
        }
        
        res.status(200).json({ 
            message: "Attendance updated successfully", 
            record: attendanceRecord 
        });
    } catch (err) {
        console.error("Error updating attendance:", err);
        res.status(500).json({ error: err.message });
    }
};

// Add new attendance session for multiple students
exports.addNewAttendance = async (req, res) => {
    try {
        const { attendanceRecords } = req.body;
        
        if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
            return res.status(400).json({ message: "Invalid attendance records" });
        }
        
        // Extract course ID and date for logging
        const firstRecord = attendanceRecords[0];
        const [courseId, sessionDate] = firstRecord.classSessionId.split('-');
        
        console.log(`Adding attendance session for course ${courseId} on ${sessionDate}`);
        
        // Process each record
        const results = [];
        
        for (const record of attendanceRecords) {
            // Validate required fields
            if (!record.studentId || !record.teacherId || !record.classSessionId) {
                console.log("Missing required fields for record:", record);
                continue;
            }
            
            // Check if record already exists
            const existingRecord = await Attendance.findOne({
                studentId: record.studentId,
                classSessionId: record.classSessionId
            });
            
            if (existingRecord) {
                console.log(`Record already exists for student ${record.studentId}`);
                results.push(existingRecord);
                continue;
            }
            
            // Create new attendance record
            const newRecord = new Attendance({
                studentId: record.studentId,
                teacherId: record.teacherId,
                classSessionId: record.classSessionId,
                status: record.status || 'P', // Default to Present
                date: record.date || new Date(),
                notes: record.notes
            });
            
            await newRecord.save();
            results.push(newRecord);
        }
        
        res.status(201).json({
            message: "Attendance session created successfully",
            recordsCreated: results.length,
            records: results
        });
    } catch (err) {
        console.error("Error adding attendance session:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get students enrolled in a course
exports.getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }
        
        // Find course and get enrolled students
        const course = await Course.findById(courseId).populate("enrolledStudents");
        
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        // If no students are enrolled, return empty array
        if (!course.enrolledStudents || course.enrolledStudents.length === 0) {
            return res.status(200).json([]);
        }
        
        res.status(200).json(course.enrolledStudents);
    } catch (err) {
        console.error("Error fetching course students:", err);
        res.status(500).json({ error: err.message });
    }
};