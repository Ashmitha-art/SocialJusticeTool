import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

// Import d3-cloud library from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min.js';
document.head.appendChild(script);

const WordCloud = () => {
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
    const data = [
      // Introduction
      { text: "Purpose", size: 70, section: "Introduction" },
      { text: "Background", size: 65, section: "Introduction" },
      { text: "Research", size: 60, section: "Introduction" },
      { text: "Context", size: 55, section: "Introduction" },
      { text: "Overview", size: 50, section: "Introduction" },
      { text: "Problem", size: 45, section: "Introduction" },
      
      // Literature Review
      { text: "Studies", size: 75, section: "Literature Review" },
      { text: "Analysis", size: 70, section: "Literature Review" },
      { text: "Previous", size: 65, section: "Literature Review" },
      { text: "Framework", size: 60, section: "Literature Review" },
      { text: "Theory", size: 55, section: "Literature Review" },
      { text: "Findings", size: 50, section: "Literature Review" },
      
      // Methodology
      { text: "Design", size: 72, section: "Methodology" },
      { text: "Approach", size: 68, section: "Methodology" },
      { text: "Participants", size: 64, section: "Methodology" },
      { text: "Data", size: 60, section: "Methodology" },
      { text: "Analysis", size: 56, section: "Methodology" },
      { text: "Procedure", size: 52, section: "Methodology" },
      
      // Results
      { text: "Findings", size: 78, section: "Results" },
      { text: "Outcomes", size: 72, section: "Results" },
      { text: "Analysis", size: 66, section: "Results" },
      { text: "Significance", size: 60, section: "Results" },
      { text: "Values", size: 54, section: "Results" },
      { text: "Patterns", size: 48, section: "Results" },
      
      // Discussion
      { text: "Interpretation", size: 75, section: "Discussion" },
      { text: "Implications", size: 70, section: "Discussion" },
      { text: "Comparison", size: 65, section: "Discussion" },
      { text: "Relationship", size: 60, section: "Discussion" },
      { text: "Insights", size: 55, section: "Discussion" },
      { text: "Meaning", size: 50, section: "Discussion" },
      
      // Limitations
      { text: "Constraints", size: 65, section: "Limitations" },
      { text: "Factors", size: 60, section: "Limitations" },
      { text: "Bias", size: 55, section: "Limitations" },
      { text: "Scope", size: 50, section: "Limitations" },
      { text: "Challenges", size: 45, section: "Limitations" },
      
      // Conclusion
      { text: "Summary", size: 72, section: "Conclusion" },
      { text: "Implications", size: 67, section: "Conclusion" },
      { text: "Future", size: 62, section: "Conclusion" },
      { text: "Recommendations", size: 57, section: "Conclusion" },
      { text: "Contribution", size: 52, section: "Conclusion" },
      
      // References
      { text: "Citations", size: 60, section: "References" },
      { text: "Sources", size: 55, section: "References" },
      { text: "Authors", size: 50, section: "References" },
      { text: "Publications", size: 45, section: "References" },
      { text: "Literature", size: 40, section: "References" }
    ];

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
      "#FFB6C1", // Light Pink - Introduction
      "#AFEEEE", // Pale Turquoise - Literature Review
      "#FFFACD", // Lemon Chiffon - Methodology
      "#D8BFD8", // Thistle - Results
      "#98FB98", // Pale Green - Discussion
      "#FFE4B5", // Moccasin - Limitations
      "#B0E0E6", // Powder Blue - Conclusion
      "#F0E68C"  // Khaki - References
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