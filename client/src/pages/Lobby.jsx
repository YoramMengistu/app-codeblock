import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);

  // Fetch code blocks when the component mounts
  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        await axios
          .get(`${import.meta.env.VITE_APP_SOCKET_URL}/api/codeblocks`)
          .then((response) => {
            setCodeBlocks(response.data);
          });
      } catch (err) {
        console.log(err);
      }
    };

    fetchCodeBlocks();
  }, []);

  return (
    <div className="h-screen bg-slate-200">
      <div className=" flex justify-center items-center h-screen flex-col">
        <h1 className="mb-4 font-serif text-3xl">Choose Code Block</h1>

        <ul className="flex gap-4 font-serif ">
          {codeBlocks.map((block) => (
            <li
              className="duration-300 transition-all hover:text-orange-300"
              key={block.title}
              onClick={() => navigate(`/codeblock/${block._id}/`)} // Navigate to the code block page
            >
              {block.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Lobby;
