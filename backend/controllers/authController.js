const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Export register function
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Ensure password is hashed before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        if (role === "teacher") {
            user = new Teacher({ name, email, password: hashedPassword });
        } else if (role === "student") {
            user = new Student({ name, email, password: hashedPassword });
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        await user.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Export login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email belongs to a Teacher or a Student
        let user = await Teacher.findOne({ email });
        let role = "teacher";

        if (!user) {
            user = await Student.findOne({ email });
            role = "student";
        }

        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("🔍 Hashed Password in DB:", user.password);
        console.log("🔍 Entered Password:", password);

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("✅ Password Match:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role }, "secret", { expiresIn: "1h" });

        res.json({
            message: `Login successful! Welcome, ${user.name}`,
            token,
            role,
            userId: user._id
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Make sure all functions are properly exported
module.exports = {
    register: exports.register,
    login: exports.login
};