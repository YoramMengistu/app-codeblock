const mongoose = require("mongoose");

const codeBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  initialCode: { type: String, required: true },
  solution: { type: String, required: true },
  mentor: { type: String, default: null }, // Socket ID of the mentor
  students: { type: [String], default: [] },
});

const CodeBlock = mongoose.model("CodeBlock", codeBlockSchema);

module.exports = CodeBlock;
