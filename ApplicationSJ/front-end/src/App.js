// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Questions from "./Components/QuestionKeywordMatch/Questions";


function App() {
  return (
    <Router>
      <div>
        {/* Define routes */}
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/questions" element={<Questions />} />
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* Catch all route for 404 Not Found */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;