import React from "react";
import WordCloud from "../DataViz/WordCloud";
import BarChart from "../DataViz/BarChart";

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
       <BarChart data={data} />

    </div>

  );
}

export default SectionTwo;
