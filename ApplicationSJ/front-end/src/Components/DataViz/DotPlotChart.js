import React from "react";
import * as d3 from "d3";
import ColorLegend from "../DataViz/pages/Legend";
import Xaxis from '../DataViz/pages/Xaxis';
import Yaxis from '../DataViz/pages/Yaxis';
import EmotionCircles from '../DataViz/pages/EmotionCircles';
import StateLines from '../DataViz/pages/StateLines';
import TwoWaySlider from '../DataViz/pages/TwoWaySlider';
import StateFilter from '../DataViz/pages/StateFilter';
import DataOrderFilter from '../DataViz/pages/DataOrderFilter';
//import HorizontalBarChart from '../DataViz/pages/HorizontalBarChart';



const DotPlotchart = () => {
    const data = [{
        state: "section 1",
        trust: 0.5,
        trust_count: 100,
        joy: 0.2,
        joy_count: 150,
        senti_positive_count: 200,
        senti_negative_count: 50,
        senti_neutral_count: 30
    },
    {
        state: "section 2",
        trust: 0.4,
        trust_count: 80,
        joy: 0.3,
        joy_count: 120,
        senti_positive_count: 180,
        senti_negative_count: 70,
        senti_neutral_count: 50
    },
    {
        state: "section 3",
        trust: 0.3,
        trust_count: 90,
        joy: 0.4,
        joy_count: 110,
        senti_positive_count: 150,
        senti_negative_count: 60,
        senti_neutral_count: 40
    },
    {
        state: "section 4",
        trust: 0.6,
        trust_count: 110,
        joy: 0.35,
        joy_count: 140,
        senti_positive_count: 210,
        senti_negative_count: 40,
        senti_neutral_count: 20
    },
    {
        state: "section 5",
        trust: 0.45,
        trust_count: 85,
        joy: 0.55,
        joy_count: 130,
        senti_positive_count: 190,
        senti_negative_count: 65,
        senti_neutral_count: 35
    },
    {
        state: "section 6",
        trust: 0.5,
        trust_count: 95,
        anger: 0.15,
        anger_count: 145,
        joy: 0.55,
        joy_count: 130,
        senti_positive_count: 205,
        senti_negative_count: 45,
        senti_neutral_count: 25
    },
    {
        state: "section 7",
        trust: 0.35,
        trust_count: 75,
        joy: 0.4,
        joy_count: 115,
        surprise: 0.4,
        surprise_count: 115,
        fear: 0.4,
        fear_count: 115,
        senti_positive_count: 160,
        senti_negative_count: 55,
        senti_neutral_count: 45
    }
       
    ];
    const dimensions = {
        width: 900,  // Width of the visualization area
        height: 400, // Height of the visualization area
        margin: {
            top: 50,
            right: 350,
            bottom: 70,
            left: 70
        }
    };
    const colorObjects = [
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
    const svgRef = React.useRef(null);
    const [hoveredValue, setHoveredValue] = React.useState(null);
    const [range, setRange] = React.useState([0, 1]);
    const [tempRange, setTempRange] = React.useState([0, 1]);
    const [filteredStates, setFilteredStates] = React.useState([]);
    const [orderOption, setOrderOption] = React.useState(null);
    // const [selectedStates, setSelectedStates] = React.useState([]);
    const [selectedLines, setSelectedLines] = React.useState([]);
    const containerRef = React.useRef(null);

    // console.log(initialData)

    const ref = d3.select(svgRef.current);
    ref.selectAll("*").remove()
    // React.useEffect(() => {
    //     console.log('tempRange:', tempRange);
    // }, [tempRange]);

    // React.useEffect(() => {
    //     console.log('range:', range);
    // }, [range]);
    //   const [lastEventType, setLastEventType] = React.useState(null);

    // const [value, setValue] = React.useState(50);
    const { width, height, margin } = dimensions;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;
    const middleX = (svgWidth / 2 - 500);
    const middleY = (svgHeight - dimensions.height);

    const colorName = d => d.emotion;
    const fadeOpacity = 0.3;
    var states = data.map((d) => d.state)
    if (filteredStates.length !== 0) {
        data = data.filter(obj => filteredStates.includes(obj.state));
    }

    const orderOptions = colorObjects.map((emotionColor) => ({
        value: emotionColor.emotion,
        label: emotionColor.emotion,
        color: emotionColor.color,
    }));

    // const handleDataOrderFilterChange = (selectedData) => {
    //     onDataOrderSelection(selectedData);
    //     // This will trigger a re-render of the chart
    //     // setData([...data]);
    // };

    const onDataOrderSelection = (selectedData) => {
        setOrderOption(selectedData);
        // if (selectedData === null) {
        //     // Reset to the original order or any default order you want to set
        //     yScale.domain(data.map((d) => d.state));
        //     return;
        // }
        // const selectedEmotion = selectedData.value;
        // data.sort((a, b) => d3.ascending(parseFloat(a[selectedEmotion]), parseFloat(b[selectedEmotion])));

        // // Update the yScale domain with the new order
        // yScale.domain(data.map((d) => d.state));
    };

    // const handleValueChange = (newValue) => {
    //     setValue(newValue);
    // };
    const handleSliderChange = (index, value) => {
        if (index === 0) {
            setTempRange((prevTempRange) => [value, prevTempRange[1]]);
        } else {
            setTempRange((prevTempRange) => [prevTempRange[0], value]);
        }
    };

    const handleSliderEnd = (index, value) => {
        if (index === 0) {
            setRange((prevRange) => [value, prevRange[1]]);
            setTempRange((prevTempRange) => [value, prevTempRange[1]]);
        } else {
            setRange((prevRange) => [prevRange[0], value]);
            setTempRange((prevTempRange) => [prevTempRange[0], value]);
        }
    };

    // const onLineClick = (selectedState) => {
    //     if (selectedStates.length < 2) {
    //       setSelectedStates(prev => [...prev, selectedState]);
    //     } else {
    //       setSelectedStates([selectedState]);
    //     }
    //   };

    const onStateSelection = (selectedData) => {
        const selectedOptions = Array.from(selectedData)
        setFilteredStates(selectedOptions);
    };

    // const handleTooltip = () => {
    //     const tooltip = d3.select(svgRef.current.parentNode).select('.tooltip1');
    //     const lineElement = svgRef.current.querySelector('[tooltipVisible="true"]');

    //     if (lineElement) {
    //       const line = d3.select(lineElement);
    //       line.attr('tooltipVisible', 'false')
    //         .attr("stroke-width", "3px")
    //         .attr('is-dashed', 'false')
    //         .attr('stroke-dasharray', null);
    //       tooltip.style('opacity', 0);
    //     }
    //     setLastEventType(null);
    //   };

    if (orderOption) {
        data.sort((a, b) => d3.ascending(parseFloat(a[orderOption.value]), parseFloat(b[orderOption.value])));
    } else {
        data.sort((a, b) => a.state.localeCompare(b.state));
    }

    if (range[0] !== 0 || range[1] !== 1) {

        const emotions = ['trust', 'joy', 'anger', 'fear', 'positive', 'sadness', 'surprise', 'anticipation', 'negative', 'disgust'];
        data = data.map(obj => {
            // create a new object with only the key/value pairs that match the condition
            const filteredObj = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key === 'state' || key === 'senti_negative_count' || key === 'senti_positive_count' || key === 'senti_neutral_count') {
                    filteredObj[key] = value;
                } else if (emotions.includes(key)) {
                    const val = parseFloat(value);
                    if (val >= range[0] && val <= range[1]) {
                        filteredObj[key] = value;
                        filteredObj[key + '_count'] = obj[key + '_count'];

                    }
                }
            }
            return filteredObj;
        });
    }
    console.log(data)


    var filteredData = [];
    if (hoveredValue) {
        filteredData = data.map(obj => {
            // create a new object with only the key/value pairs that match the condition
            const filteredObj = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key === 'state' || key === 'senti_negative_count' || key === 'senti_positive_count' || key === 'sent_neutral_count' || key === hoveredValue.emotion) {
                    filteredObj[key] = value;
                }
            }
            return filteredObj;
        });
    }

    const xScale = d3.scaleLinear()
        .domain([0, 0.6])
        .range([0, width])
        .nice();

    const yScale = d3.scaleBand()
        .range([0, height])
        .domain(data.map((d) => d.state))
        .padding(1);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setSelectedLines([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);
    return (
        <svg
            width={svgWidth}
            height={svgHeight} >
            <>

                <Xaxis scale={xScale} tickSize={-height} transform={`translate(${margin.left}, ${height + margin.top})`} />
                <Yaxis scale={yScale} transform={`translate(${margin.left}, ${margin.top})`} />
/*
                <StateLines
                    data={data}
                    xScale={xScale}
                    yScale={yScale}
                    // onLineClick={onLineClick} // Added onClick event handler
                    // selectedStates={selectedStates}
                    selectedLines={selectedLines}
                    setSelectedLines={setSelectedLines}
                    transform={`translate(${margin.left}, ${margin.top})`} />

                {/* {selectedItems.length > 1 && // Conditional rendering of the new SVG bar chart
                <BarChart
                    data={selectedItems} // Pass the selected lines as data to the new component
                    dimensions={{ width: 500, height: 500, margin: { top: 20, right: 20, bottom: 30, left: 40 } }}
                />
            } */}

                <EmotionCircles
                    colorObjects={colorObjects}
                    data={data}
                    xScale={xScale}
                    yScale={yScale}
                    opacity={hoveredValue ? fadeOpacity : 1}
                    transform={`translate(${margin.left}, ${margin.top})`}
                />
                <EmotionCircles
                    colorObjects={colorObjects}
                    data={filteredData}
                    xScale={xScale}
                    yScale={yScale}
                    opacity={hoveredValue ? 1 : fadeOpacity}
                    transform={`translate(${margin.left}, ${margin.top})`}
                />
                <g className="tooltip" style={{ opacity: 0 }}>
                    <rect x="0" y="0" width="200" height="70" fill="#fff2ed" stroke="black" strokeWidth="1" rx="5" ry="5" />
                    <text className="tooltip-text" x="10" y="25" style={{ fontSize: 12 }}></text>
                </g>
                <g className="tooltip1" style={{ opacity: 0 }}>
                    <rect x="0" y="0" width="250" height="180" fill="#fff2ed" stroke="black" strokeWidth="1" rx="5" ry="5" />
                    <text className="tooltip-text" x="10" y="25" style={{ fontSize: 12 }}></text>
                </g>
                <ColorLegend
                    tickSpacing={22}
                    tickSize={10}
                    tickTextOffset={12}
                    colorScale={colorObjects}
                    onHover={setHoveredValue}
                    hoveredValue={hoveredValue}
                    fadeOpacity={fadeOpacity}
                    transform={`translate(${svgWidth - 290}, ${margin.top + 50})`}
                />
                <text x={svgWidth-220} y={margin.top + 30} className="legend-label" textAnchor="middle" fontSize={25}>Emotion Colors: </text>
                <TwoWaySlider
                    width={280}
                    height={80}
                    onSliderChange={handleSliderChange}
                    onSliderEnd={handleSliderEnd}
                    start={range[0]} // Pass the start value
                    end={range[1]}
                    transform={`translate(${svgWidth - 300}, ${height - 500})`} />

                <text x={svgWidth - 270} y={margin.top + 350} className="legend-label" textAnchor="middle" fontSize={25}> </text>

                <text x={svgWidth / 2} y={height + margin.bottom + 20} textAnchor="middle" className="axis-label">
                    Emotion scores
                </text>

                {/* <text x={-height / 2} y={30} transform="rotate(-90)" textAnchor="middle" className="axis-label">
                    States
                </text> */}
                <StateFilter
                    states={states}
                    onStateSelection={onStateSelection}
                    // style={{ position: "absolute", top: "20px", right: "20px" }}
                    transform={`translate(${svgWidth - 310}, ${height - 400})`}
                />
                <text x={svgWidth - 240} y={margin.top + 450} className="legend-label" textAnchor="middle" fontSize={25}> </text>

  
                <text x={svgWidth - 250} y={margin.top + 755} className="legend-label" textAnchor="middle" fontSize={25}>Order by: </text>
                <text x={150} y={30} className="legend-label" textAnchor="middle" fontSize={25}>Sentiment Analysis </text>


            </>
            <g>
              
            </g>

        </svg>
    );
};

export default DotPlotchart;