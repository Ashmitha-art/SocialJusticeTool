import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Sample data representing social justice themes and connections
const sampleData = {
  nodes: [
    { id: "relevance_impact", name: "Relevance & Impact", frequency: 40 },
    { id: "growth_mindset", name: "Growth Mindset", frequency: 25 },
    { id: "clarity_purpose", name: "Clarity & Purpose", frequency: 12 },
    { id: "tone_language", name: "Tone & Language", frequency: 22 },
    { id: "inclusivity", name: "Inclusivity", frequency: 30 },
    { id: "equity", name: "Equity", frequency: 20 },
    { id: "support_accessibility", name: "Support & Accessibility", frequency: 18 },
    { id: "instructor_transparency", name: "Instructor Transparency", frequency: 26 }
  ],
  links: [
    { source: "relevance_impact", target: "clarity_purpose", weight: 18 },
    { source: "relevance_impact", target: "growth_mindset", weight: 15 },
    { source: "relevance_impact", target: "tone_language", weight: 12 },
    { source: "growth_mindset", target: "support_accessibility", weight: 14 },
    { source: "growth_mindset", target: "instructor_transparency", weight: 17 },
    { source: "clarity_purpose", target: "tone_language", weight: 20 },
    { source: "clarity_purpose", target: "instructor_transparency", weight: 16 },
    { source: "tone_language", target: "inclusivity", weight: 19 },
    { source: "tone_language", target: "equity", weight: 13 },
    { source: "inclusivity", target: "equity", weight: 22 },
    { source: "inclusivity", target: "support_accessibility", weight: 18 },
    { source: "inclusivity", target: "instructor_transparency", weight: 10 },
    { source: "equity", target: "support_accessibility", weight: 16 },
    { source: "equity", target: "instructor_transparency", weight: 9 },
    { source: "support_accessibility", target: "instructor_transparency", weight: 14 }
  ]
};

// Color scheme for the nodes
const colorScale = d3.scaleOrdinal()
  .domain([
    "relevance_impact", "growth_mindset", "clarity_purpose", "tone_language", 
    "inclusivity", "equity", "support_accessibility", "instructor_transparency"
  ])
  .range([
    "#FF7043", // Relevance & Impact - warm orange
    "#66BB6A", // Growth Mindset - vibrant green
    "#42A5F5", // Clarity & Purpose - clear blue
    "#FFC107", // Tone & Language - amber
    "#AB47BC", // Inclusivity - purple
    "#26A69A", // Equity - teal
    "#7E57C2", // Support & Accessibility - deep purple
    "#FF5722"  // Instructor Transparency - deep orange
  ]);


// Dimensions with margin (similar to DotPlot approach)
const DIMENSIONS = {
  width: 500,
  height: 400,
  margin: { top: 50, right: 350, bottom: 70, left: 70 }
};

const NetworkGraph = () => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState(DIMENSIONS);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
  
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
      .attr("height", dimensions.height + dimensions.margin.top + dimensions.margin.bottom);
    
    // Create a group for the graph with margin transform
    const graph = svg.append("g")
      .attr("transform", `translate(${dimensions.margin.left}, ${dimensions.margin.top})`)
      .attr("class", "graph");

    // Calculate node radius based on frequency
    const nodeRadius = d => Math.pow(d.frequency, 0.8) * 2 + 5;

    // Create the simulation
    const simulation = d3.forceSimulation(sampleData.nodes)
      .force("link", d3.forceLink(sampleData.links)
        .id(d => d.id)
        .distance(d => 200 - d.weight * 3)
        .strength(0.8))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collide", d3.forceCollide().radius(d => nodeRadius(d) + 10).iterations(2));

    // Create the links
    const link = graph.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(sampleData.links)
      .enter().append("line")
      .attr("stroke-width", d => Math.pow(d.weight, 0.8) * 0.4 + 0.5)
      .attr("stroke", "#f7cd9c")
      .attr("stroke-opacity", 0.6);

    // Create the nodes
    const node = graph.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(sampleData.nodes)
      .enter().append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => colorScale(d.id))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
        if (d !== selectedNode) {
          d3.select(event.currentTarget).attr("stroke", "#000").attr("stroke-width", 2.5);
        }
      })
      .on("mouseout", (event, d) => {
        setHoveredNode(null);
        if (d !== selectedNode) {
          d3.select(event.currentTarget).attr("stroke", "#fff").attr("stroke-width", 1.5);
        }
      })
      .on("click", (event, d) => {
        // If clicking the same node, deselect it
        if (selectedNode === d) {
          setSelectedNode(null);
          // Reset all nodes and links
          node.attr("stroke", "#fff").attr("stroke-width", 1.5).attr("opacity", 1);
          link.attr("stroke", "#f7cd9c").attr("stroke-opacity", 0.6).attr("stroke-width", d => Math.pow(d.weight, 0.8) * 0.4 + 0.5);
          label.style("font-weight", "normal").style("opacity", 1);
        } else {
          setSelectedNode(d);
          
          // Find connected nodes and links
          const connectedNodeIds = new Set();
          const connectedLinks = sampleData.links.filter(l => {
            if (l.source.id === d.id || l.target.id === d.id) {
              connectedNodeIds.add(typeof l.source === 'object' ? l.source.id : l.source);
              connectedNodeIds.add(typeof l.target === 'object' ? l.target.id : l.target);
              return true;
            }
            return false;
          });
          
          // Highlight the selected node and its connections
          node.attr("stroke", n => connectedNodeIds.has(n.id) ? "#000" : "#fff")
              .attr("stroke-width", n => connectedNodeIds.has(n.id) ? 3 : 1.5)
              .attr("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.3);
          
          // Highlight the selected node more prominently
          d3.select(event.currentTarget)
            .attr("stroke", "#ff5722")
            .attr("stroke-width", 4);
          
          // Highlight connected links
          link.attr("stroke", l => 
              (l.source.id === d.id || l.target.id === d.id) ? "#ff5722" : "#999"
            )
            .attr("stroke-opacity", l => 
              (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2
            )
            .attr("stroke-width", l => 
              (l.source.id === d.id || l.target.id === d.id) ? Math.sqrt(l.weight) + 1 : Math.sqrt(l.weight) / 2
            );
            
          // Emphasize labels of connected nodes
          label.style("font-weight", n => connectedNodeIds.has(n.id) ? "bold" : "normal")
               .style("opacity", n => connectedNodeIds.has(n.id) ? 1 : 0.3);
        }
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add labels to the nodes
    const label = graph.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(sampleData.nodes)
      .enter().append("text")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("font-size", "10px")
      .style("pointer-events", "none")
      .style("fill", "#333")
      .style("font-weight", "bold")
      .style("text-shadow", "0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white");

    // Create SVG legend (similar to DotPlot's ColorLegend approach)
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${dimensions.width + dimensions.margin.left + 50}, ${dimensions.margin.top + 50})`)
      .attr("class", "legend");
    
    // Add title to legend
    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", -20)
      .attr("font-weight", "bold")
      .text("Legend");
    
    // Add legend items
    const legendItems = legendGroup.selectAll(".legend-item")
      .data(sampleData.nodes)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 22})`)
      .on("mouseover", (event, d) => {
        // Highlight the corresponding node
        node.filter(n => n.id === d.id)
          .attr("stroke", "#000")
          .attr("stroke-width", 2.5);
      })
      .on("mouseout", (event, d) => {
        // Reset the node if it's not the selected node
        if (selectedNode?.id !== d.id) {
          node.filter(n => n.id === d.id)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        }
      })
      .style("cursor", "pointer");
    
    // Add colored circles
    legendItems.append("circle")
      .attr("r", 5)
      .attr("fill", d => colorScale(d.id));
    
    // Add text labels
    legendItems.append("text")
      .attr("x", 12)
      .attr("dy", ".32em")
      .text(d => d.name);

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      // Keep nodes within bounds
      sampleData.nodes.forEach(d => {
        d.x = Math.max(nodeRadius(d), Math.min(dimensions.width - nodeRadius(d), d.x));
        d.y = Math.max(nodeRadius(d), Math.min(dimensions.height - nodeRadius(d), d.y));
      });

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Add zoom capability
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        graph.attr("transform", `translate(${event.transform.x + dimensions.margin.left}, ${event.transform.y + dimensions.margin.top}) scale(${event.transform.k})`);
      });

    svg.call(zoom);



    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  // Calculate full dimensions for container
  const svgWidth = dimensions.width + dimensions.margin.left + dimensions.margin.right;
  const svgHeight = dimensions.height + dimensions.margin.top + dimensions.margin.bottom;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
      
      {/* Tooltip for hovering - positioned using absolute positioning */}
      {hoveredNode && (
        <div style={{
          position: "absolute",
          left: hoveredNode.x + dimensions.margin.left + 10,
          top: hoveredNode.y + dimensions.margin.top - 10,
          backgroundColor: "white",
          padding: "8px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          fontSize: "12px",
          pointerEvents: "none"
        }}>
          <p style={{ fontWeight: "bold", margin: "0 0 4px 0" }}>{hoveredNode.name}</p>
          <p style={{ margin: "0 0 4px 0" }}>Frequency: {hoveredNode.frequency} occurrences</p>
          <p style={{ margin: "0" }}>Connected to: {
            sampleData.links
              .filter(link => 
                (typeof link.source === 'object' ? link.source.id : link.source) === hoveredNode.id || 
                (typeof link.target === 'object' ? link.target.id : link.target) === hoveredNode.id
              )
              .length
          } themes</p>
        </div>
      )}
      
      {/* Details panel for selected node - positioned in bottom left */}
      {selectedNode && (
        <div style={{
          position: "absolute",
          left: dimensions.margin.left + 10,
          bottom: dimensions.margin.bottom + 10,
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          fontSize: "14px",
          maxWidth: "300px"
        }}>
          <p style={{ fontWeight: "bold", fontSize: "16px", margin: "0 0 6px 0" }}>{selectedNode.name}</p>
          <p style={{ margin: "0 0 8px 0" }}>This theme appears <span style={{ fontWeight: "600" }}>{selectedNode.frequency}</span> times in the syllabus.</p>
          
          <p style={{ fontWeight: "bold", margin: "8px 0 4px 0" }}>Connected themes:</p>
          <ul style={{ margin: "0", paddingLeft: "20px" }}>
            {sampleData.links
              .filter(link => 
                (typeof link.source === 'object' ? link.source.id : link.source) === selectedNode.id || 
                (typeof link.target === 'object' ? link.target.id : link.target) === selectedNode.id
              )
              .map(link => {
                const connectedNodeId = 
                  (typeof link.source === 'object' ? link.source.id : link.source) === selectedNode.id 
                    ? (typeof link.target === 'object' ? link.target.id : link.target)
                    : (typeof link.source === 'object' ? link.source.id : link.source);
                
                const connectedNode = sampleData.nodes.find(n => n.id === connectedNodeId);
                return (
                  <li key={connectedNodeId} style={{ marginBottom: "4px" }}>
                    <span style={{ fontWeight: "500" }}>{connectedNode?.name}</span>
                    <span style={{ color: "#666" }}> (connection strength: {link.weight})</span>
                  </li>
                );
              })
            }
          </ul>
          <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#777" }}>Click again to deselect</p>
        </div>
      )}
      
      {/* Reset button - positioned in top right */}
      {selectedNode && (
        <button 
          onClick={() => {
            setSelectedNode(null);
            // Reset all nodes and links
            d3.select(svgRef.current).selectAll(".nodes circle")
              .attr("stroke", "#fff")
              .attr("stroke-width", 1.5)
              .attr("opacity", 1);
              
            d3.select(svgRef.current).selectAll(".links line")
              .attr("stroke", "#f7cd9c")
              .attr("stroke-opacity", 0.6)
              .attr("stroke-width", d => Math.sqrt(d.weight) / 2 + 1);
              
            d3.select(svgRef.current).selectAll(".labels text")
              .style("font-weight", "normal")
              .style("opacity", 1);
          }}
          style={{
            position: "absolute",
            top: dimensions.margin.top / 2,
            right: dimensions.margin.right / 2,
            backgroundColor: "#3B82F6",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          Reset View
        </button>
      )}
    </div>
  );
};

export default NetworkGraph;