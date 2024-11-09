import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import WordCloud from "./Components/DataViz/WordCloud";
import BarChart from "./Components/DataViz/BarChart";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wordcloud" element={<WordCloud />} />
          <Route path="/barchart" element={<BarChart />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
