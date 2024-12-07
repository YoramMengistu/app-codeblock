const CodeBlock = require("../model/codeBlockSchema");

// default blocks
const defaultCodeBlocks = [
  {
    title: "Add Two Numbers",
    initialCode: `function add(a, b) {
      return a + b;
    }

    console.log(add(2, 3));`,
    solution: `function add(a, b) {
      return a + b;
    }

    console.log(add(a, b)); // output: 5`,
  },
  // ... שאר ה-blocks
];

// function to create a default if they don't exist
const createDefaultCodeBlocks = async () => {
  try {
    // בדוק אם כבר יש Blocks במסד הנתונים
    const existingBlocks = await CodeBlock.find().exec();

    // אם אין שום Code Block, צור אותם
    if (existingBlocks.length === 0) {
      await CodeBlock.insertMany(defaultCodeBlocks);
      console.log("Code blocks created successfully!");
    } else {
      console.log("Code blocks already exist in the database.");
    }
  } catch (error) {
    console.error("Error creating code blocks:", error.message);
  }
};

// Get all code blocks
const getCodeBlocks = async (req, res) => {
  try {
    const blocks = await CodeBlock.find().limit(100).exec(); 
    res.status(200).json(blocks);
  } catch (error) {
    console.error("Error fetching code blocks:", error.message);
    res.status(500).json({
      message: "Error fetching code blocks",
      error: error.message,
    });
  }
};

// יצירת default code blocks אם הם לא קיימים
createDefaultCodeBlocks();

module.exports = {
  getCodeBlocks,
};
