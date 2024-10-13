import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { wordfrequency } from '../Data/wordfrequency';

const BarChart = () => {
  const data = wordfrequency

  const chartRef = useRef(null);

  useEffect(() => {
    // Set up the dimensions and margins of the graph
    const margin = { top: 20, right: 30, bottom: 40, left: 100 },
      width = 500 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;

    // Clear any previous chart elements
    d3.select(chartRef.current).selectAll('*').remove();

    // Create the SVG container and set its dimensions
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.word))
      .range([0, height])
      .padding(0.1);

    // Add the x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10));

    // Add the y-axis
    svg.append('g')
      .call(d3.axisLeft(y));

    // Create horizontal bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d.word))
      .attr('width', d => x(d.frequency))
      .attr('height', y.bandwidth())
      .attr('fill', '#5187B7');

    // Add labels to the bars (inside the bars, aligned to the right)
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.frequency) - 5) // Adjust to place the label inside the bar
      .attr('y', d => y(d.word) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', 'end')
      .text(d => d.frequency);
  }, [data]);

  return (
    <div>
      <h2>Word Frequency Bar Chart (Horizontal)</h2>
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default BarChart;