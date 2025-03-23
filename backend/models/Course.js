const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true
    },
    courseName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    // Other fields as needed
});

module.exports = mongoose.model("Course", CourseSchema);