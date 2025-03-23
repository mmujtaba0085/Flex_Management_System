const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    rollNumber: { type: String, unique: true, required: true },
    class: { type: String, required: true },
    // Add reference to enrolled courses
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }]
});

module.exports = mongoose.model("Student", StudentSchema);