import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // <-- Make sure this line is present

createRoot(document.getElementById("root")).render(<App />);
