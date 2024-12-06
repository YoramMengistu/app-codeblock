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
  {
    title: "Concatenate Strings",
    initialCode: `function concatenate(str1, str2) {
      // implement this function
    }

    console.log(concatenate('Hello', ' World'));`,
    solution: `function concatenate(str1, str2) {
      return str1 + str2;
    }

    console.log(concatenate('Hello', ' World')); // output: 'Hello World'`,
  },
  {
    title: "Multiply Two Numbers",
    initialCode: `function multiply(a, b) {
      // implement this function
    }

    console.log(multiply(3, 4));`,
    solution: `function multiply(a, b) {
      return a * b;
    }

    console.log(multiply(3, 4)); // output: 12`,
  },
  {
    title: "Check Even or Odd",
    initialCode: `function checkEvenOrOdd(num) {
      // implement this function
    }

    console.log(checkEvenOrOdd(4));`,
    solution: `function checkEvenOrOdd(num) {
      return num % 2 === 0 ? 'Even' : 'Odd';
    }

    console.log(checkEvenOrOdd(4)); // output: 'Even'
    console.log(checkEvenOrOdd(5)); // output: 'Odd'`,
  },
];

// function to create a default if they don't exist
const createDefaultCodeBlocks = async () => {
  try {
    const existingBlocks = await CodeBlock.find();
    if (existingBlocks.length === 0) {
      await CodeBlock.insertMany(defaultCodeBlocks);
      console.log("Code blocks created successfully!");
    } else {
      console.log("Code blocks already exist in the database.");
    }
  } catch (error) {
    console.error("Error creating code blocks:", error);
  }
};

// Get all code blocks
const getCodeBlocks = async (req, res) => {
  try {
    const blocks = await CodeBlock.find();
    res.status(200).json(blocks);
  } catch (error) {
    console.error("Error fetching code blocks:", error);
    res.status(500).json({
      message: "Error fetching code blocks",
      error: error.message,
    });
  }
};

createDefaultCodeBlocks();

module.exports = {
  getCodeBlocks,
};
