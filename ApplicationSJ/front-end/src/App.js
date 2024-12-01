import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import WordCloud from "./Components/DataViz/WordCloud";
import BarChart from "./Components/DataViz/BarChart";
import DotPlot from "./Components/DataViz/DotPlotChart";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wordcloud" element={<WordCloud />} />
          <Route path="/barchart" element={<BarChart />} />
          <Route path="/dotplot" element={<DotPlot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
