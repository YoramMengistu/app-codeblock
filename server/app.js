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
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

let mentors = {};
let students = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // join room
  socket.on("joinCodeBlock", async (codeBlockId) => {
    console.log(`${socket.id} joined code block ${codeBlockId}`);

    if (socket.rooms.has(codeBlockId)) {
      console.log(`${socket.id} is already in the room`);
      return;
    }

    if (!mentors[codeBlockId]) {
      mentors[codeBlockId] = socket.id;
      socket.emit("setRole", "mentor");
    } else {
      if (!students[codeBlockId]) students[codeBlockId] = [];
      students[codeBlockId].push(socket.id);
      socket.emit("setRole", "student");
    }

    socket.join(codeBlockId);

    io.to(codeBlockId).emit(
      "studentsCount",
      students[codeBlockId]?.length || 0
    );

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

  // check solution
  socket.on("checkSolution", (submittedCode) => {
    const codeBlockId = Object.keys(mentors).find(
      (id) => mentors[id] === socket.id
    );
    if (codeBlockId) {
      const codeBlock = CodeBlock.findById(codeBlockId);
      const expectedSolution = codeBlock?.solution;

      if (submittedCode === expectedSolution) {
        socket.emit("solutionMatch"); // Sends a message that the solution is correct
      }
    }
    socket.on("solutionMatched", ({ blockId }) => {
      // Send to students that the solution matches
      io.to(blockId).emit("solutionMatch");
    });
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    let codeBlockId = null;

    // זיהוי החדר שבו המשתמש נמצא (מנטור או סטודנט)
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

    // אם המנטור עזב, הקצה סטודנט כמנטור חדש
    if (codeBlockId && mentors[codeBlockId] === socket.id) {
      // אם יש סטודנטים בחדר, נבחר אחד מהם כמנטור
      if (students[codeBlockId]?.length > 0) {
        const newMentor = students[codeBlockId].shift(); // בחר סטודנט ראשון
        mentors[codeBlockId] = newMentor; // הגדרת הסטודנט כמנטור
        socket.to(newMentor).emit("setRole", "mentor"); // שולח הודעה לסטודנט להפוך למנטור
        io.to(codeBlockId).emit("studentsCount", students[codeBlockId].length); // עדכון כמות הסטודנטים
      }
    }

    // עדכון סטודנטים ומנטור במידה והמשתמש היה סטודנט או מנטור
    if (codeBlockId) {
      io.to(codeBlockId).emit("mentorLeft");
      io.to(codeBlockId).emit("redirectToHome");
    }

    // עדכון רשימות הסטודנטים והמנהלים
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
        io.to(codeBlockId).emit("redirectToHome");
        io.to(codeBlockId).emit("mentorLeft");
        break;
      }
    }
  });
});

app.use(cors({ origin: "http://localhost:5174" }));
app.use(express.json());

// Route
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
