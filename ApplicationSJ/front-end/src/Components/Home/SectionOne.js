import React from "react";

function SectionOne() {
  return (
    <div className="viz-element">
  
      <img
        src={`${process.env.PUBLIC_URL}/weather_heatmap.png`} // Correct path from the public folder
        alt="Weather Heatmap"
        style={{ width: "100%"}}
      />
    </div>
  );
}

export default SectionOne;
