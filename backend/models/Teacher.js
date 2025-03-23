const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    subject: { type: String, required: true },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }] // Stores assigned courses
});

module.exports = mongoose.model("Teacher", TeacherSchema);
