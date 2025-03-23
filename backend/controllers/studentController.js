const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, rollNumber, class: studentClass } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new Student({ name, email, password: hashedPassword, rollNumber, class: studentClass });
        await student.save();
        res.status(201).json({ message: "Student registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
