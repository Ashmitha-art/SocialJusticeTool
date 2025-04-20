import React, { useEffect } from "react";
import * as d3 from "d3";

function Heatmap() {
  useEffect(() => {
    // Fetch CSV data
    d3.csv(`${process.env.PUBLIC_URL}/heatmap_data.csv`).then((data) => {
      const margin = { top: 80, right: 30, bottom: 120, left: 50 }; // Increased margin for clarity
      const width = 900 - margin.left - margin.right; // Adjusted width for better spacing
      const height = 500 - margin.top - margin.bottom; // Adjusted height for better spacing

      // Select container and clear previous SVG content
      const svgContainer = d3.select("#heatmap");
      svgContainer.selectAll("*").remove(); // Clear any existing content

      const svg = svgContainer
        .append("svg")
        .attr(
          "viewBox",
          `0 0 ${width + margin.left + margin.right} ${
            height + margin.top + margin.bottom
          }`
        ) // Responsive scaling
        .attr("preserveAspectRatio", "xMidYMid meet") // Maintain aspect ratio
        .style("width", "100%") // Fit parent container
        .style("height", "auto");

      const container = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Prepare the data
      const sectionNames = Object.keys(data[0]).slice(1); // Skip first column
      const questionNames = data.map((d) => d[""]);

      const heatmapData = [];
      data.forEach((row, rowIndex) => {
        sectionNames.forEach((col, colIndex) => {
          heatmapData.push({
            question: questionNames[rowIndex],
            section: col,
            value: +row[col],
          });
        });
      });

      // Scales
      const x = d3
        .scaleBand()
        .domain(sectionNames)
        .range([0, width])
        .padding(0.05); // Increased padding for better spacing
      const y = d3
        .scaleBand()
        .domain(questionNames)
        .range([0, height])
        .padding(0.05); // Increased padding for better spacing
      const color = d3
        .scaleLinear()
        .domain([0, d3.max(heatmapData, (d) => d.value)])
        .range(["#f2f0f7", "#9b59b6"]); // Soft purple to deep violet

      // Tooltip
      const tooltip = d3
        .select("#heatmap")
        .append("div")
        .attr("class", "tooltip");

      // Axis styles
      container
        .append("g")
        .call(d3.axisTop(x))
        .attr("class", "x-axis")
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .style("fill", "#333"); // Increased font contrast

      container
        .append("g")
        .call(d3.axisLeft(y))
        .attr("class", "y-axis")
        .style("font-size", "14px")
        .style("fill", "#333"); // Increased font contrast

      // Draw heatmap with interactive tooltips
      container
        .selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.section))
        .attr("y", (d) => y(d.question))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", (d) => color(d.value))
        .style("stroke", "#ccc")
        .style("stroke-width", 1)
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .text(`${d.section} - ${d.question}: ${d.value}`);
          d3.select(this).style("stroke", "#000").style("stroke-width", 2);
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this).style("stroke", "#ccc").style("stroke-width", 1);
        });

      // Add color legend
      const legendWidth = 300;
      const legendHeight = 20;

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width + margin.left + 20},${margin.top})`
        );

      const legendColor = d3
        .scaleLinear()
        .domain([0, d3.max(heatmapData, (d) => d.value)])
        .range(["#f2f0f7", "#9b59b6"]);

      const legendAxis = d3
        .axisRight(legendColor)
        .ticks(5)
        .tickSize(legendHeight);

      legend
        .append("g")
        .attr("class", "legend")
        .call(legendAxis)
        .style("font-size", "12px")
        .style("fill", "#333"); // Legend text contrast
    });
  }, []);

  return (
    <div id="heatmap" className="heatmap-container">
      <div className="tooltip"></div>
    </div>
  );
}

export default Heatmap;
