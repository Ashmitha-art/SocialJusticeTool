import React from "react";

function SectionTwo() {
  return (
    <div>
      <h2>Section Two</h2>
      <p>Content for Section Two.</p>
      <img
        src={`${process.env.PUBLIC_URL}/weather_heatmap.png`} // Correct path from the public folder
        alt="Weather Heatmap"
        style={{ width: "100%", height: "30%" }}
      />
    </div>
  );
}

export default SectionTwo;
