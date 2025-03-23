const express = require("express");
const { registerTeacher, assignCourses, getTeacherCourses } = require("../controllers/teacherController");

const router = express.Router();

router.post("/register", registerTeacher);
router.post("/assign-courses", assignCourses);
// Fix the route path - remove 'teachers/' prefix
router.get('/courses/:teacherId', getTeacherCourses);

module.exports = router;