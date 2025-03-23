const Marks = require("../models/Marks");

exports.assignMarks = async (req, res) => {
    try {
        const { studentId, teacherId, quizId, marks } = req.body;
        const newMarks = new Marks({ studentId, teacherId, quizId, marks });
        await newMarks.save();
        res.status(201).json({ message: "Marks assigned successfully!" });
    } catch (err) {
        console.error("Error assigning marks:", err);
        res.status(500).json({ error: err.message });
    }
};
