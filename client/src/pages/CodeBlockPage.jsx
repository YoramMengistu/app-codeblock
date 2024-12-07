import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/worker-javascript";
import socketIOClient from "socket.io-client";

// Configuring the worker path for Ace editor

ace.config.set(
  "workerPath",
  "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14"
);

const CodeBlockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(""); // State for the code in the editor
  const [role, setRole] = useState("mentor"); // Initializing the state to be a mentor
  const [students, setStudents] = useState(0);
  const [solution, setSolution] = useState("");
  const [showSmiley, setShowSmiley] = useState(false);

  const socketRef = useRef(null); // Ref to store the socket connection

  // useEffect to set up socket connection and handle real-time events

  useEffect(() => {
    socketRef.current = socketIOClient(import.meta.env.VITE_APP_SOCKET_URL);
    const socket = socketRef.current;

    socket.emit("joinCodeBlock", id); // Join the specific code block room

    socket.on("setRole", (role) => {
      // Listen for role assignment from the server
      setRole(role);
    });

    socket.on("studentsCount", (count) => {
      // Listen for the count of students in the room
      setStudents(count);
    });

    socket.on("codeBlockData", (data) => {
      // Listen for the initial code and solution
      setCode(data.initialCode);
      setSolution(data.solution);
    });

    socket.on("codeChange", (newCode) => {
      // Listen for code changes from other users
      setCode(newCode);
    });

    socket.on("solutionMatch", () => {
      setShowSmiley(true);
    });

    socket.on("mentorLeft", () => {
      // Listen for mentor leaving
      alert("The mentor has left the session. Redirecting to lobby...");
      navigate("/");
    });

    socket.on("setRole", (newRole) => {
      setRole(newRole);
      if (newRole === "mentor") {
        alert("You are now the mentor!");
      }
    });

    socket.on("redirectToHome", () => {
      alert("The mentor has left. Redirecting to home...");
      navigate("/");
    });

    // Cleanup function to remove socket event listeners and leave the room when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveCodeBlock", id);
        socketRef.current.off();
      }
    };
  }, [id, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socketRef.current.emit("codeChange", { blockId: id, code: newCode });

    if (newCode === solution) {
      socketRef.current.emit("solutionMatched", { blockId: id });
      setShowSmiley(true);
    } else {
      setShowSmiley(false);
    }
  };

  const handleRunCode = () => {
    if (code === solution) {
      setShowSmiley(true);
      socketRef.current.emit("solutionMatched", { blockId: id, code }); // שליחת הפתרון לשרת
    } else {
      setShowSmiley(false);
    }
  };

  return (
    <div className="h-screen bg-slate-200">
      <div className="flex flex-col justify-center h-screen items-center">
        <h1>{`Code Block ${id}`}</h1>
        <div className="font-serif text-3xl gap-2 mb-4">
          <h3>Role: {role ? role : "Loading..."}</h3>
          <h4>{students} students are in the room</h4>
        </div>
        <AceEditor
          mode="javascript"
          theme="monokai"
          name="code_editor"
          value={code}
          onChange={handleCodeChange}
          editorProps={{ $blockScrolling: true }}
          readOnly={role === "mentor"}
        />
        <button onClick={handleRunCode}>Run</button>
        {showSmiley && <h1>😊</h1>}
      </div>
    </div>
  );
};

export default CodeBlockPage;
