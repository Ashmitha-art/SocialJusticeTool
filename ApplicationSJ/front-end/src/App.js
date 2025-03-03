import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import Home2 from "./Components/Home/Home2";
import NetworkGraph from "./Components/DataViz/NetworkGraph";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home2 />} />
          <Route path="/network" element={<NetworkGraph />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
