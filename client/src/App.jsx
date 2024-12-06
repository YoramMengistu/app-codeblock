// // src/App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Lobby from "./pages/Lobby";
// import CodeBlock from "./pages/CodeBlockPage";

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Lobby />} />
//         <Route path="/codeblock/:id" element={<CodeBlock />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Lobby = lazy(() => import("./pages/Lobby"));
const CodeBlock = lazy(() => import("./pages/CodeBlockPage"));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/codeblock/:id" element={<CodeBlock />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
