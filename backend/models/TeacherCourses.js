const mongoose = require("mongoose");

const TeacherCoursesSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }
});

module.exports = mongoose.model("TeacherCourses", TeacherCoursesSchema);
