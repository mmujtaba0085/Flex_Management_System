const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    classSessionId: { type: String, required: true },
    status: { type: String, enum: ["P", "A", "L"], required: true },
    date: { type: Date, default: Date.now },
});

// Pre-save middleware to ensure date is a Date object
AttendanceSchema.pre("save", function (next) {
    if (this.date && typeof this.date === 'string') {
        this.date = new Date(this.date);
    }
    next();
});

module.exports = mongoose.model("Attendance", AttendanceSchema);