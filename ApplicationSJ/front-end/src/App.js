import React from "react";
import Dashboard from "./Components/Dashboard";
import SectionOne from "./Components/SectionOne";
import SectionTwo from "./Components/SectionTwo";
import SectionThree from "./Components/SectionThree";
import SectionFour from "./Components/SectionFour";
import "./styles.css";

function App() {
  return (
    <div className="app-container">
      <Dashboard />

      <div className="main-content">
        <div className="content-grid">
          <div className="content-box">
            <SectionOne />
          </div>
          <div className="content-box">
            <SectionTwo />
          </div>
          <div className="content-box">
            <SectionThree />
          </div>
          <div className="content-box">
            <SectionFour />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

// // src/App.js
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./Components/Home/Home";
// import WordCloud from "./Components/DataViz/WordCloud";
// import BarChart from "./Components/DataViz/BarChart";

// function App() {
//   return (
//     <Router>
//       <div>
//         {/* Define routes */}
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/wordcloud" element={<WordCloud />} />
//           <Route path="/barchart" element={<BarChart/>} />
//           {/* <Route path="/contact" element={<Contact />} /> */}
//           {/* Catch all route for 404 Not Found */}
//           {/* <Route path="*" element={<NotFound />} /> */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
