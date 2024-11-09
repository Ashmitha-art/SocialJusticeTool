import React from "react";

function SectionOne() {
  return (
    <div>
      <h2>Section One</h2>
      <p>Content for Section One.</p>
      <img
        src={`${process.env.PUBLIC_URL}/weather_heatmap.png`} // Correct path from the public folder
        alt="Weather Heatmap"
        style={{ width: "100%", height: "30%" }}
      />
    </div>
  );
}

export default SectionOne;
