import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

// Import d3-cloud library from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min.js';
document.head.appendChild(script);

const WordCloud = ({data}) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    // Wait for d3-cloud to load
    const checkD3Cloud = () => {
      if (window.d3 && window.d3.layout && window.d3.layout.cloud) {
        createWordCloud();
      } else {
        setTimeout(checkD3Cloud, 100);
      }
    };
    
    checkD3Cloud();
    

  }, []);

  const createWordCloud = () => {
    // Academic paper sections with relevant keywords and frequencies
    
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up SVG dimensions to fit inside card
    const width = 750;
    const height = 500;
    
    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    // Define pastel color scale for academic paper sections
    const sections = [...new Set(data.map(d => d.section))];
    
    const pastelColors = [
      "#FF69B4", // Light Pink - Introduction
      "#20B2AA", // Pale Turquoise - Literature Review
      "#9370DB", // Lemon Chiffon - Methodology
      "#DA70D6", // Thistle - Results
      "#32CD32", // Pale Green - Discussion
      "#FF7F50", // Moccasin - Limitations
      "#87CEEB", // Powder Blue - Conclusion
      "#DAA520"  // Khaki - References
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(sections)
      .range(pastelColors);

    // Size scale with significant difference between small and large words
    const fontSizeScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.size))
      .range([12, 60]);

    // Create the layout
    const layout = window.d3.layout.cloud()
      .size([width, height])
      .words(data.map(d => ({
        text: d.text,
        size: fontSizeScale(d.size),
        section: d.section,
        originalSize: d.size
      })))
      .padding(5)
      .rotate(() => 0) // No rotation for better readability
      .fontSize(d => d.size)
      .on("end", draw);

    // Start the layout
    layout.start();

    // Function to draw the words
    function draw(words) {
      svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text")
        .data(words)
        .join("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", d => colorScale(d.section))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .text(d => d.text)
        .append("title") // Tooltip on hover
        .text(d => `${d.text} (Section: ${d.section}, Frequency: ${d.originalSize})`);

        
    }
    

    

  };

  return (
    <div className="flex flex-col items-center">

        <div className="bg-white p-6">
          <svg ref={svgRef} width="100%" height="500"></svg>
        </div>
      </div>
 
  );
};

export default WordCloud;