import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";



const WordCloud = () => {
    const data = [
    
  { word: "class", frequency: 10 },
  { word: "organ systems", frequency: 3.7 },
  { word: "cadaver labs", frequency: 3.0 },
  { word: "essay questions", frequency: 2.5 },
  { word: "human body", frequency: 2.5 },
  { word: "online resources", frequency: 2.4 },
  { word: "electronic devices", frequency: 2.2 },
  { word: "contemporary understanding", frequency: 2.1 },
  { word: "electronically supported", frequency: 2.0 },
  { word: "expected", frequency: 1.9 },
  { word: "knowledge understanding", frequency: 1.9 },
  { word: "interacted extensively", frequency: 1.8 },
  { word: "performing dissections", frequency: 1.8 },
  { word: "responsible", frequency: 1.8 },
  { word: "anatomical structures", frequency: 1.7 },
  { word: "accurately", frequency: 1.7 },
  { word: "disarticulated bones", frequency: 1.7 },
  { word: "virtual laboratory", frequency: 1.6 },
  { word: "understand", frequency: 1.6 },
  { word: "emergencies written", frequency: 1.6 }
];
      
  const svgRef = useRef();

  useEffect(() => {
    // Set up dimensions
    const width = 600;
    const height = 400;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create word cloud layout
    const layout = cloud()
      .size([width, height])
      .words(data.map((d) => ({ text: d.word, size: d.frequency })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90)) // Randomly rotate 0 or 90 degrees
      .fontSize((d) => d.size * 10) // Adjust font size based on frequency
      .on("end", drawCloud);

    layout.start();

    function drawCloud(words) {
      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

      svg
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("fill", (d, i) => d3.schemeCategory10[i % 10]) // Set colors
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${[d.x, d.y]}) rotate(${d.rotate})`)
        .text((d) => d.text);
    }
  }, [data]);

  return   (<div style={{ textAlign: "center" }}>

  <h2> Keyword Frequency</h2>
  <svg ref={svgRef}></svg>
</div>)
};

export default WordCloud;