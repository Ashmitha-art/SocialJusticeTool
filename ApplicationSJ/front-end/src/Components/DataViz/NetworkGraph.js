import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Sample data representing social justice themes and connections
const sampleData = {
  nodes: [
    { id: "diversity", name: "Diversity", frequency: 25 },
    { id: "equity", name: "Equity", frequency: 30 },
    { id: "inclusion", name: "Inclusion", frequency: 22 },
    { id: "racial_justice", name: "Racial Justice", frequency: 18 },
    { id: "gender_equality", name: "Gender Equality", frequency: 15 },
    { id: "environmental_justice", name: "Environmental Justice", frequency: 12 },
    { id: "social_justice", name: "Social Justice", frequency: 28 },
    { id: "disability_rights", name: "Disability Rights", frequency: 10 },
    { id: "lgbtq_rights", name: "LGBTQ+ Rights", frequency: 14 },
    { id: "indigenous_rights", name: "Indigenous Rights", frequency: 8 }
  ],
  links: [
    { source: "diversity", target: "inclusion", weight: 20 },
    { source: "diversity", target: "equity", weight: 15 },
    { source: "equity", target: "inclusion", weight: 18 },
    { source: "equity", target: "racial_justice", weight: 12 },
    { source: "racial_justice", target: "social_justice", weight: 16 },
    { source: "gender_equality", target: "equity", weight: 14 },
    { source: "gender_equality", target: "social_justice", weight: 13 },
    { source: "environmental_justice", target: "social_justice", weight: 10 },
    { source: "environmental_justice", target: "indigenous_rights", weight: 7 },
    { source: "disability_rights", target: "inclusion", weight: 9 },
    { source: "disability_rights", target: "equity", weight: 8 },
    { source: "lgbtq_rights", target: "inclusion", weight: 11 },
    { source: "lgbtq_rights", target: "equity", weight: 10 },
    { source: "lgbtq_rights", target: "gender_equality", weight: 12 },
    { source: "indigenous_rights", target: "racial_justice", weight: 6 },
    { source: "social_justice", target: "inclusion", weight: 17 },
    { source: "social_justice", target: "equity", weight: 19 }
  ]
};

// Color scheme for the nodes
const colorScale = d3.scaleOrdinal()
  .domain([
    "diversity", "equity", "inclusion", "racial_justice", "gender_equality", 
    "environmental_justice", "social_justice", "disability_rights", "lgbtq_rights", "indigenous_rights"
  ])
  .range([
    "#E57373", "#81C784", "#64B5F6", "#FFD54F", "#BA68C8", 
    "#4DB6AC", "#9575CD", "#FF8A65", "#7986CB", "#A1887F"
  ]);

// Legend component
const Legend = ({ nodes, colorScale }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md h-full">
      <h3 className="font-bold mb-3 text-sm border-b pb-2">Legend</h3>
      <div className="flex flex-col space-y-3">
        {nodes.map(node => (
          <div key={node.id} className="flex items-center">
            <div 
              className="w-5 h-5 rounded-full mr-3 flex-shrink-0" 
              style={{ backgroundColor: colorScale(node.id) }}
            ></div>
            <span className="text-sm">{node.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkGraph = () => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current.parentElement;
      setDimensions({
        width: container.clientWidth,
        height: Math.max(500, container.clientWidth * 0.6)
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);

    // Define arrow markers for the links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", d => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Create a group for the graph
    const graph = svg.append("g")
      .attr("class", "graph");

    // Calculate node radius based on frequency
    const nodeRadius = d => Math.sqrt(d.frequency) * 3 + 10;

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
      .attr("stroke-width", d => Math.sqrt(d.weight) / 2 + 1)
      .attr("stroke", "#999")
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
          link.attr("stroke", "#999").attr("stroke-opacity", 0.6).attr("stroke-width", d => Math.sqrt(d.weight) / 2 + 1);
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

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", d => Math.max(nodeRadius(d.source), Math.min(dimensions.width - nodeRadius(d.source), d.source.x)))
        .attr("y1", d => Math.max(nodeRadius(d.source), Math.min(dimensions.height - nodeRadius(d.source), d.source.y)))
        .attr("x2", d => Math.max(nodeRadius(d.target), Math.min(dimensions.width - nodeRadius(d.target), d.target.x)))
        .attr("y2", d => Math.max(nodeRadius(d.target), Math.min(dimensions.height - nodeRadius(d.target), d.target.y)));

      node
        .attr("cx", d => Math.max(nodeRadius(d), Math.min(dimensions.width - nodeRadius(d), d.x)))
        .attr("cy", d => Math.max(nodeRadius(d), Math.min(dimensions.height - nodeRadius(d), d.y)));

      label
        .attr("x", d => Math.max(nodeRadius(d), Math.min(dimensions.width - nodeRadius(d), d.x)))
        .attr("y", d => Math.max(nodeRadius(d), Math.min(dimensions.height - nodeRadius(d), d.y)));
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
        graph.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <div className="w-full h-full">
      <div className="bg-gray-100 p-4 rounded-lg shadow-md h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Social Justice Themes Network Graph</h2>
            <p className="text-sm text-gray-600">
              Visualizing interconnections between social justice themes in syllabus content
            </p>
          </div>
          {selectedNode && (
            <button 
              onClick={() => {
                setSelectedNode(null);
                // Reset all nodes and links - this needs to reference the current d3 selections
                d3.select(svgRef.current).selectAll(".nodes circle")
                  .attr("stroke", "#fff")
                  .attr("stroke-width", 1.5)
                  .attr("opacity", 1);
                  
                d3.select(svgRef.current).selectAll(".links line")
                  .attr("stroke", "#999")
                  .attr("stroke-opacity", 0.6)
                  .attr("stroke-width", d => Math.sqrt(d.weight) / 2 + 1);
                  
                d3.select(svgRef.current).selectAll(".labels text")
                  .style("font-weight", "normal")
                  .style("opacity", 1);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
            >
              Reset View
            </button>
          )}
        </div>
        
        <div className="flex flex-row" style={{ height: dimensions.height }}>
          {/* Main graph container */}
          <div className="relative w-3/4">
            <svg ref={svgRef} className="w-full h-full" />
            {hoveredNode && (
              <div className="absolute bg-white p-2 rounded shadow-md text-sm" 
                  style={{ 
                    left: Math.min(dimensions.width - 200, hoveredNode.x + 10), 
                    top: Math.min(dimensions.height - 100, hoveredNode.y - 10) 
                  }}>
                <p className="font-bold">{hoveredNode.name}</p>
                <p>Frequency: {hoveredNode.frequency} occurrences</p>
                <p>Connected to: {
                  sampleData.links
                    .filter(link => 
                      (typeof link.source === 'object' ? link.source.id : link.source) === hoveredNode.id || 
                      (typeof link.target === 'object' ? link.target.id : link.target) === hoveredNode.id
                    )
                    .length
                } themes</p>
              </div>
            )}
            
            {selectedNode && (
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-md text-sm">
                <p className="font-bold text-base mb-1">{selectedNode.name}</p>
                <p className="mb-2">This theme appears <span className="font-semibold">{selectedNode.frequency}</span> times in the syllabus.</p>
                
                <p className="font-bold mt-2 mb-1">Connected themes:</p>
                <ul className="list-disc pl-5">
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
                        <li key={connectedNodeId} className="mb-1">
                          <span className="font-medium">{connectedNode?.name}</span>
                          <span className="text-gray-600"> (connection strength: {link.weight})</span>
                        </li>
                      );
                    })
                  }
                </ul>
                <p className="mt-3 text-xs text-gray-500">Click again to deselect</p>
              </div>
            )}
          </div>
          
          {/* Legend container - fixed width and positioned to the right */}
          <div className="w-1/4 pl-4">
            <Legend nodes={sampleData.nodes} colorScale={colorScale} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;