import React from "react";
import DotPlotChart from "../DataViz/DotPlotChart";


function SectionTwo() {
  const data = [
    { word: "Hello", frequency: 10 },
    { word: "World", frequency: 20 },
    { word: "React", frequency: 15 },
    { word: "D3", frequency: 5 },
    { word: "Cloud", frequency: 7 },
    { word: "Word", frequency: 12 },
  ];
  return (
    <div className="viz-element">
     <DotPlotChart/>

    </div>

  );
}

export default SectionTwo;
