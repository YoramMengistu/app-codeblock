const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const CodeBlock = require("./model/codeBlockSchema");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://block-code.netlify.app", // Allow only this origin to connect
    methods: ["GET", "POST"],
  },
});

let mentors = {}; // Object to keep track of mentors
let students = {}; // Object to keep track of students

// Handle socket connections

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Join room
  socket.on("joinCodeBlock", async (codeBlockId) => {
    // Prevent joining the same room twice
    if (socket.rooms.has(codeBlockId)) {
      console.log(`${socket.id} is already in the room`);
      return;
    }

    // Assign mentor role if no mentor exists in the room
    if (!mentors[codeBlockId]) {
      mentors[codeBlockId] = socket.id;
      socket.emit("setRole", "mentor");
    } else {
      // Otherwise, assign student role
      if (!students[codeBlockId]) students[codeBlockId] = [];
      students[codeBlockId].push(socket.id);
      socket.emit("setRole", "student"); // Send student role to client
    }

    socket.join(codeBlockId);
    //  the number of students in the room
    io.to(codeBlockId).emit(
      "studentsCount",
      students[codeBlockId]?.length || 0
    );

    // Fetch the code block data from MongoDB
    try {
      const codeBlock = await CodeBlock.findById(codeBlockId);
      if (!codeBlock) {
        socket.emit("error", { message: "Code block not found" });
        return;
      }
      socket.emit("codeBlockData", {
        initialCode: codeBlock.initialCode,
        solution: codeBlock.solution,
      });
    } catch (error) {
      console.error("Error fetching code block:", error);
      socket.emit("error", { message: "Error fetching code block" });
    }
  });

  // // Check if the submitted solution matches the expected solution
  socket.on("checkSolution", async (submittedCode) => {
    const codeBlockId = Object.keys(mentors).find(
      (id) => mentors[id] === socket.id
    );
    if (codeBlockId) {
      try {
        const codeBlock = await CodeBlock.findById(codeBlockId);
        const expectedSolution = codeBlock?.solution;

        if (submittedCode === expectedSolution) {
          socket.emit("solutionMatch"); // שולח הודעה שהפתרון נכון
        }
      } catch (error) {
        console.error("Error fetching code block:", error);
        socket.emit("error", { message: "Error fetching code block" });
      }
    }
  });

  // Handle socket disconnect events
  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    let codeBlockId = null;

    // Identify the code block room the user belongs to (mentor or student)

    for (let id in mentors) {
      if (mentors[id] === socket.id) {
        codeBlockId = id;
        break;
      }
    }

    for (let id in students) {
      if (students[id].includes(socket.id)) {
        codeBlockId = id;
        break;
      }
    }

    if (codeBlockId && mentors[codeBlockId] === socket.id) {
      if (students[codeBlockId]?.length > 0) {
        const newMentor = students[codeBlockId].shift();
        mentors[codeBlockId] = newMentor;
        socket.to(newMentor).emit("setRole", "mentor");
        io.to(codeBlockId).emit("studentsCount", students[codeBlockId].length);
      }
    }
    // Notify the room of the mentor leaving
    if (codeBlockId) {
      io.to(codeBlockId).emit("mentorLeft");
      io.to(codeBlockId).emit("redirectToHome");
    }

    // Update the students and mentors lists
    for (let codeBlockId in students) {
      if (students[codeBlockId].includes(socket.id)) {
        students[codeBlockId] = students[codeBlockId].filter(
          (id) => id !== socket.id
        );
        io.to(codeBlockId).emit(
          "studentsCount",
          students[codeBlockId]?.length || 0
        );
        break;
      }
    }

    for (let codeBlockId in mentors) {
      if (mentors[codeBlockId] === socket.id) {
        delete mentors[codeBlockId];
        io.to(codeBlockId).emit("redirectToHome"); // Notify all users in the room
        io.to(codeBlockId).emit("mentorLeft");
        break;
      }
    }
  });
});

// Middleware setup
app.use(cors({ origin: "*" }));
app.use(express.json());

// API Route
app.use("/api/codeblocks", require("./routes/codeBlockRoute"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // הגדרת timeout ל-5 שניות
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

const port = 5007;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
