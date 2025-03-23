const express = require("express");
const { assignMarks } = require("../controllers/marksController");
const router = express.Router();

router.post("/assign", assignMarks);

module.exports = router;
