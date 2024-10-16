import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";



const WordCloud = ({data}) => {
   
     
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