import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
// import EmotionDifferenceBarChart from '../views/EmotionDifferenceBarChart';

function StateLines({ data, xScale, yScale, transform, onLineClick, selectedStates, selectedLines, setSelectedLines }) {
  const svgRef = useRef(null);
  // const [selectedLines, setSelectedLines] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const showTooltip = (tooltip, event, d) => {
    tooltip.style('opacity', 1).style('pointer-events', 'none', 'z-index','2');
    updateTooltipContent(tooltip, d);

    const svgRect = svgRef.current.getBoundingClientRect();
    const tooltipRect = tooltip.node().getBoundingClientRect();
    const tooltipHeight = tooltipRect.height;
    const tooltipWidth = tooltipRect.width;

    let tooltipX = event.pageX + 1;
    let tooltipY = event.pageY - tooltipHeight;

    // if (tooltipX + tooltipWidth > svgRect.right) {
    //   tooltipX = tooltipX - tooltipWidth - 25;
    // }
    if (tooltipY < svgRect.top) {
      tooltipY = svgRect.top + 10;
    }
    if (tooltipY + tooltipHeight > svgRect.bottom) {
      tooltipY = svgRect.bottom - tooltipHeight - 10;
    }

    tooltip.attr('transform', `translate(${tooltipX}, ${tooltipY})`);
  };

  const hideTooltip = (tooltip) => {
    tooltip.style('opacity', 0);
  };

  const updateTooltipContent = (tooltip, d) => {
    tooltip.select('.tooltip-text')
      .html('')
      .append('tspan')
      .attr('x', 10)
      .attr('dy', 0)
      .attr('font-size', '1.2em')
      .attr('font-weight', 'bold')
      .attr('fill', 'black')
      .text(`State: ${d.state}`);

    const emotions = ['trust', 'joy', 'anger', 'fear', 'positive', 'sadness', 'surprise', 'anticipation', 'negative', 'disgust'];
    const sortedEmotions = emotions.map(emotion => ({ emotion, score: d[emotion] })).sort((a, b) => b.score - a.score);

    sortedEmotions
      .filter(emotionObj => !isNaN(emotionObj.score))
      .forEach((emotionObj, i) => {
        tooltip.select('.tooltip-text')
          .append('tspan')
          .attr('x', 10)
          .attr('dy', '1.2em')
          .text(`${emotionObj.emotion}: {Score: ${Number(emotionObj.score).toFixed(2)}, Tweets: ${d[emotionObj.emotion + '_count']} }`)
      });
  };
  const emotions = ['trust', 'joy', 'anger', 'fear', 'positive', 'sadness', 'surprise', 'anticipation', 'negative', 'disgust'];

  const handleLineClick = (event, d) => {
    event.stopPropagation();
    if (selectedLines.length < 2 && !selectedLines.includes(d.state)) {
      setSelectedLines([...selectedLines, d.state]);
    } else if (selectedLines.includes(d.state)) {
      setSelectedLines(selectedLines.filter(state => state !== d.state));
    }
  };

  const handleWindowClick = () => {
    setSelectedLines([]);
  };

  useEffect(() => {
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  useEffect(() => {
    if (selectedLines.length === 2) {
      const [firstStateData, secondStateData] = selectedLines.map(selectedLine => data.find(d => d.state === selectedLine));
      const barChartData = emotions.map(emotion => ({
        emotion,
        [firstStateData.state]: firstStateData[emotion],
        [secondStateData.state]: secondStateData[emotion],
        difference: Math.abs(firstStateData[emotion] - secondStateData[emotion])
      }));
      setBarChartData(barChartData);
    } else {
      setBarChartData([]);
    }
  }, [selectedLines, data]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    svg.selectAll("line")
      .data(data)
      .join("line")
      .attr("x1", d => xScale(d3.min([d.trust, d.joy, d.anger, d.fear, d.positive, d.sadness, d.surprise, d.anticipation, d.negative, d.disgust])))
      .attr("x2", d => xScale(d3.max([d.trust, d.joy, d.anger, d.fear, d.positive, d.sadness, d.surprise, d.anticipation, d.negative, d.disgust])))
      .attr("y1", d => yScale(d.state))
      .attr("y2", d => yScale(d.state))
      .attr("stroke", "grey")
      .attr("stroke-width", d => selectedLines.includes(d.state) ? "6px" : "3px")
      .attr("stroke-dasharray", d => selectedLines.includes(d.state) ? "5,5" : null)
      .style('cursor', 'pointer')
      .style('pointer-events', 'auto')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr("stroke-width", "6px");
        const tooltip = d3.select(svgRef.current.parentNode).select('.tooltip1');
        showTooltip(tooltip, event, d);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).attr("stroke-width", d => selectedLines.includes(d.state) ? "6px" : "3px");
        const tooltip = d3.select(svgRef.current.parentNode).select('.tooltip1');
        hideTooltip(tooltip);
      })
      .on('click', handleLineClick);;
  }, [data, xScale, yScale, selectedLines]);

  return (
    <>
      <g ref={svgRef} transform={transform}></g>
      {/* <EmotionDifferenceBarChart barChartData={barChartData} /> */}
    </>
  );
}

export default StateLines; 