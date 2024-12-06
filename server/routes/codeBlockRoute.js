// server/routes/codeBlocks.js
const express = require("express");
const { getCodeBlocks } = require("../controller/codeBlockController");
const router = express.Router();

// GET all code blocks
router.get("/", getCodeBlocks);

module.exports = router;
