import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SentimentGraph = () => {
  // Create ref for the SVG element
  const svgRef = useRef(null);
  
  // Generate dummy data for sentiment analysis
  // Each section has positive, negative, and neutral values
  const data = [
    { section: "Introduction", positive: 25, negative: 8, neutral: 12 },
    { section: "Literature Review", positive: 18, negative: 15, neutral: 30 },
    { section: "Methodology", positive: 12, negative: 5, neutral: 40 },
    { section: "Results", positive: 30, negative: 10, neutral: 15 },
    { section: "Discussion", positive: 22, negative: 18, neutral: 25 },
    { section: "Limitations", positive: 8, negative: 32, neutral: 10 },
    { section: "Conclusion", positive: 35, negative: 6, neutral: 14 },
    { section: "References", positive: 5, negative: 2, neutral: 8 }
  ];
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear any existing chart and tooltips
    d3.select(svgRef.current).selectAll("*").remove();
    d3.selectAll(".tooltip").remove();
    
    // Set dimensions and margins
    const margin = { top: 40, right: 80, bottom: 60, left: 160 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.section))
      .range([0, height])
      .padding(0.2);
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.positive + d.negative + d.neutral)])
      .range([0, width]);
    
    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("font-size", "12px");
    
    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .attr("font-size", "12px");
      
    // Add vertical dotted grid lines
    svg.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(x.ticks(10))
      .join("line")
      .attr("x1", d => x(d))
      .attr("y1", 0)
      .attr("x2", d => x(d))
      .attr("y2", height)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1);
    
    // Add x-axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Keyword Frequency")
      .attr("font-size", "14px");
    
    // Add y-axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 50)
      .attr("x", -height / 2)
      .text("Document Sections")
      .attr("font-size", "14px");
    
    // Create stacked data
    const stack = d3.stack()
      .keys(["positive", "negative", "neutral"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    
    const stackedData = stack(data);
    
    // Create color scale with pastel colors
    const color = d3.scaleOrdinal()
      .domain(["positive", "negative", "neutral"])
      .range(["#A8E6CF", "#FFB7B2", "#B2DFFB"]);
    
    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "8px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("max-width", "200px");
      
    // Create and add the bars with tooltips
    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("y", d => y(d.data.section))
      .attr("x", d => x(d[0]))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .on("mouseover", function(event, d) {
        // Calculate percentage of total for this section
        const sentimentKey = d3.select(this.parentNode).datum().key;
        const sectionTotal = d.data.positive + d.data.negative + d.data.neutral;
        const sentimentValue = d.data[sentimentKey];
        const percentage = ((sentimentValue / sectionTotal) * 100).toFixed(1);
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`
          <strong>${d.data.section}</strong><br/>
          <span style="color:${color(sentimentKey)}">&#9632;</span> 
          ${sentimentKey.charAt(0).toUpperCase() + sentimentKey.slice(1)}<br/>
          Score: ${sentimentValue}<br/>
          Percentage: ${percentage}%
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
    
    // Add legend
    const legendItems = ["positive", "negative", "neutral"];
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(legendItems)
      .join("g")
      .attr("transform", (d, i) => `translate(${width},${i * 20 - 30})`);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d));
    
    legend.append("text")
      .attr("x", 20)
      .attr("y", 7.5)
      .attr("dy", "0.32em")
      .text(d => d.charAt(0).toUpperCase() + d.slice(1));
    


  }, []);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <svg ref={svgRef} className="w-full"></svg>
    </div>
  );
};

export default SentimentGraph;