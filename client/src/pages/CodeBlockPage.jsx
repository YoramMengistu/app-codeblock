
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/worker-javascript";
import socketIOClient from "socket.io-client";

ace.config.set(
  "workerPath",
  "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14"
);

const CodeBlockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [role, setRole] = useState("mentor"); // תפקיד המנטור או הסטודנט
  const [students, setStudents] = useState(0);
  const [solution, setSolution] = useState("");
  const [showSmiley, setShowSmiley] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = socketIOClient(import.meta.env.VITE_APP_SOCKET_URL);
    const socket = socketRef.current;

    socket.emit("joinCodeBlock", id);

    socket.on("setRole", (role) => {
      setRole(role);
    });

    socket.on("studentsCount", (count) => {
      setStudents(count);
    });

    socket.on("codeBlockData", (data) => {
      setCode(data.initialCode);
      setSolution(data.solution);
    });

    socket.on("codeChange", (newCode) => {
      setCode(newCode);
    });

    socket.on("solutionMatch", () => {
      setShowSmiley(true);
    });

    socket.on("mentorLeft", () => {
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

    // ניקוי החיבור ב- useEffect כדי למנוע דליפות זיכרון
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
