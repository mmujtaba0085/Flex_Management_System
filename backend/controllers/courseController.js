const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
    try {
        const { courseName, department, section } = req.body;
        const courseCode = `${courseName}-${department}-${section}`.toUpperCase();
        
        const newCourse = new Course({ courseName, department, section, courseCode });
        await newCourse.save();

        res.status(201).json({ message: "Course created successfully!", course: newCourse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
