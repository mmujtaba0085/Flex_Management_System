const express = require("express");
const { 
    getAttendance, 
    updateAttendance, 
    addNewAttendance,
    getCourseStudents, 
    addAttendanceForStudent
} = require("../controllers/attendanceController");
const router = express.Router();

// Attendance routes
router.get("/view/:courseCode", getAttendance);
router.post("/attendance/add", addAttendanceForStudent);
router.post("/update", updateAttendance);
router.post("/add", addNewAttendance);

// Course students route
router.get("/courses/:courseId/students", getCourseStudents);

module.exports = router;