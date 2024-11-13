import React from "react";
import WordCloud from "../DataViz/WordCloud";

function SectionThree() {
  const data = [
    { word: "social", frequency: 9 },
    { word: "inclusive", frequency: 7 },
    { word: "report", frequency: 10 },
    { word: "data", frequency: 5 },
    { word: "assignment", frequency: 7 },
    { word: "jobs", frequency: 12 },
  ];
  return (
    <div className="viz-element">
        <WordCloud data={data} />

    </div>

  );
}

export default SectionThree;
