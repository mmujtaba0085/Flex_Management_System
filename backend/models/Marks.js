const mongoose = require("mongoose");

const MarksSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    quizId: { type: String, required: true },
    marks: { type: Number, required: true },
});

module.exports = mongoose.model("Marks", MarksSchema);
