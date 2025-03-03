import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Constants
const DIMENSIONS = {
  width: 600,
  height: 400,
  margin: { top: 50, right: 350, bottom: 70, left: 70 }
};

const EMOTION_COLORS = [
  { emotion: "trust", color: "#1f77b4" },
  { emotion: "joy", color: "#ff7f0e" },
  { emotion: "anger", color: "#d62728" },
  { emotion: "fear", color: "#9467bd" },
  { emotion: "positive", color: "#2ca02c" },
  { emotion: "negative", color: "#bcbd22" },
  { emotion: "sadness", color: "#17becf" },
  { emotion: "surprise", color: "#e377c2" },
  { emotion: "anticipation", color: "#8c564b" },
  { emotion: "disgust", color: "#7f7f7f" }
];

const FADE_OPACITY = 0.3;

// Tooltip component
const Tooltip = ({ x, y, content, visible }) => {
  if (!visible) return null;
  
  return (
    <g transform={`translate(${x + 10}, ${y - 10})`}>
      <rect
        x={0}
        y={0}
        width={120}
        height={50}
        fill="white"
        stroke="#ccc"
        strokeWidth={2}
        rx={4}
        ry={4}
        opacity={1.5}
      />
      <text x={10} y={20} fontSize={12} fill="#333">
        {content.emotion}: {content.value.toFixed(3)}
      </text>
      <text x={10} y={35} fontSize={12} fill="#666">
        Count: {content.count}
      </text>
    </g>
  );
};

// Subcomponents
const ColorLegend = ({ colorScale, onHover, hoveredValue, transform }) => {
  return (
    <g transform={transform}>
      {colorScale.map((d, i) => (
        <g 
          key={d.emotion}
          transform={`translate(0, ${i * 22})`}
          onMouseEnter={() => onHover(d)}
          onMouseLeave={() => onHover(null)}
          style={{ cursor: 'pointer' }}
          opacity={hoveredValue && hoveredValue.emotion !== d.emotion ? FADE_OPACITY : 1}
        >
          <circle r={5} fill={d.color} />
          <text x={12} dy=".32em">{d.emotion}</text>
        </g>
      ))}
    </g>
  );
};

const EmotionCircles = ({ data, xScale, yScale, colorObjects, opacity, transform, onDotHover, onDotLeave }) => {
  return (
    <g transform={transform}>
      {data.map(d => 
        Object.entries(d).map(([key, value]) => {
          const emotionColor = colorObjects.find(c => c.emotion === key);
          if (!emotionColor || key === 'state' || key.includes('count')) return null;
          
          return (
            <circle
              key={`${d.state}-${key}`}
              cx={xScale(value)}
              cy={yScale(d.state)}
              r={5}
              fill={emotionColor.color}
              opacity={opacity}
              onMouseEnter={(e) => onDotHover(e, {
                emotion: key,
                value: value,
                count: d[`${key}_count`],
                state: d.state
              })}
              onMouseLeave={onDotLeave}
              style={{ cursor: 'pointer' }}
            />
          );
        })
      )}
    </g>
  );
};

const Axis = ({ scale, transform, orientation = "bottom", tickSize = 0 }) => {
  const ref = useRef();

  useEffect(() => {
    const axis = orientation === "bottom" 
      ? d3.axisBottom(scale).tickSize(tickSize)
      : d3.axisLeft(scale);
    
    d3.select(ref.current).call(axis);
  }, [scale, orientation, tickSize]);

  return <g ref={ref} transform={transform} />;
};

// Main Component
const DotPlotChart = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [range, setRange] = useState([0, 1]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [orderBy, setOrderBy] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null
  });

  const { width, height, margin } = DIMENSIONS;
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  const handleDotHover = (event, content) => {
    const bounds = event.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      content
    });
  };

  const handleDotLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  // Data processing
  useEffect(() => {
    let processedData = [...initialData];

    // Apply state filtering
    if (filteredStates.length > 0) {
      processedData = processedData.filter(d => filteredStates.includes(d.state));
    }

    // Apply range filtering
    if (range[0] !== 0 || range[1] !== 1) {
      processedData = processedData.map(d => {
        const newD = { state: d.state };
        Object.entries(d).forEach(([key, value]) => {
          if (typeof value === 'number' && value >= range[0] && value <= range[1]) {
            newD[key] = value;
          }
        });
        return newD;
      });
    }

    // Apply ordering
    if (orderBy) {
      processedData.sort((a, b) => d3.ascending(a[orderBy], b[orderBy]));
    }

    setData(processedData);
  }, [initialData, filteredStates, range, orderBy]);

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, 0.6])
    .range([0, width])
    .nice();

  const yScale = d3.scaleBand()
    .range([0, height])
    .domain(data.map(d => d.state))
    .padding(1);

  return (
    <svg width={svgWidth} height={svgHeight}>
      <Axis 
        scale={xScale} 
        transform={`translate(${margin.left}, ${height + margin.top})`} 
        tickSize={-height}
      />
      <Axis 
        scale={yScale} 
        transform={`translate(${margin.left}, ${margin.top})`} 
        orientation="left"
      />

      <EmotionCircles
        data={data}
        xScale={xScale}
        yScale={yScale}
        colorObjects={EMOTION_COLORS}
        opacity={hoveredValue ? FADE_OPACITY : 1}
        transform={`translate(${margin.left}, ${margin.top})`}
        onDotHover={handleDotHover}
        onDotLeave={handleDotLeave}
      />

      {hoveredValue && (
        <EmotionCircles
          data={data.map(d => ({
            state: d.state,
            [hoveredValue.emotion]: d[hoveredValue.emotion],
            [`${hoveredValue.emotion}_count`]: d[`${hoveredValue.emotion}_count`]
          }))}
          xScale={xScale}
          yScale={yScale}
          colorObjects={EMOTION_COLORS}
          opacity={1}
          transform={`translate(${margin.left}, ${margin.top})`}
          onDotHover={handleDotHover}
          onDotLeave={handleDotLeave}
        />
      )}

      <ColorLegend
        colorScale={EMOTION_COLORS}
        onHover={setHoveredValue}
        hoveredValue={hoveredValue}
        transform={`translate(${svgWidth - 290}, ${margin.top + 50})`}
      />

      <Tooltip {...tooltip} />

      {/* Chart title */}
      <text 
        x={svgWidth / 2} 
        y={30} 
        textAnchor="middle" 
        fontSize={25}
      >
        Sentiment Analysis
      </text>

      {/* Axis labels */}
      <text 
        x={svgWidth / 2} 
        y={height + margin.bottom + 20} 
        textAnchor="middle"
      >
        Emotion scores
      </text>
    </svg>
  );
};

export default DotPlotChart;