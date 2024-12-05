import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function EmotionCircles({ colorObjects, data, xScale, yScale, transform, opacity }) {
  const svgRef = useRef();

  useEffect(() => {
    const ref = d3.select(svgRef.current);
    ref.selectAll("*").remove()

    const filteredColorObjects = colorObjects.filter(object => {
      return data.some(d => Object.prototype.hasOwnProperty.call(d, object.emotion));
    });

    filteredColorObjects.forEach(object => {
      ref.selectAll(`circle.${object.emotion}`)
        .data(data.filter(d => d[object.emotion] !== undefined)) // <-- Add this line
        .join('circle')
        .attr('class', object.emotion)
        .attr('cx', d => xScale(d[object.emotion]))
        .attr('cy', d => yScale(d.state))
        .attr('r', 6)
        .style('fill', object.color)
        .attr('opacity', opacity)
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('pointer-events', 'all')
        .style('stroke-opacity', 0.5)
        .style('stroke-opacity', 0.5)
        // .on('mouseenter', (event, d) => {
        //   const tooltip = d3.select('.tooltip');
        //   console.log('tooltip', tooltip)
        //   tooltip.transition()
        //     .duration(200)
        //     .style('opacity', .9);
        //   tooltip.html(`WOW: ${d.state}<br/>Emotion: ${object.emotion}<br/>Value: ${d[object.emotion]}`)
        //     .style('left', (event.pageX + 10) + 'px')
        //     .style('top', (event.pageY - 28) + 'px');
        // })
        // .on('mouseover', (event, d) => {
        //   const tooltip = d3.select(event.currentTarget.parentNode).select('.tooltip');
        //   tooltip.transition()
        //     .duration(200)
        //     .style('opacity', .9);
        //   tooltip.html(`WOW: ${d.state}<br/>Emotion: ${object.emotion}<br/>Value: ${d[object.emotion]}`)
        //     .style('left', (event.pageX + 10) + 'px')
        //     .style('top', (event.pageY - 28) + 'px');
        // })        
        .on('mouseenter', (event, d) => {
          d3.select(event.currentTarget).attr('r', 12);

          // console.log('tooltip-in', d)
          const tooltip = d3.select(svgRef.current.parentNode).select('.tooltip');
          tooltip.transition()
            .delay(100)
            .duration(200).style('opacity', 1);
          // tooltip.select('.tooltip-text').html(`WOW: ${d.state}<br/>Emotion: ${object.emotion}<br/>Value: ${d[object.emotion]}`);
          tooltip.select('.tooltip-text')
            .html('')
            .append('tspan')
            .attr('x', 10)
            .attr('dy', 0)
            .attr('font-size', '1.2em')
            .attr('font-weight', 'bold')
            .text(`Emotion: ${object.emotion}`)
            .attr('fill', 'black');
          tooltip.select('.tooltip-text')
            .append('tspan')
            .attr('x', 10)
            .attr('dy', '1.2em')
            .text(`State: ${d.state}`);
          tooltip.select('.tooltip-text')
            .append('tspan')
            .attr('x', 10)
            .attr('dy', '1.2em')
            .text(`Score: ${d[object.emotion]}`);

          const svgRect = svgRef.current.getBoundingClientRect();
          const tooltipRect = tooltip.node().getBoundingClientRect();
          const tooltipHeight = tooltipRect.height;
          const tooltipWidth = tooltipRect.width;

          // Calculate the tooltip position
          const [translateX, translateY] = transform.match(/translate\(([^,]+),\s*([^)]+)\)/).slice(1).map(Number);
          let tooltipX = xScale(d[object.emotion]) + translateX + 17;
          let tooltipY = yScale(d.state) + translateY - tooltipHeight - 10;


          // Check if the tooltip is out of the SVG boundaries
          // if (tooltipX + tooltipWidth > svgRect.right) {
          //   tooltipX = svgRect.right - tooltipWidth - 10;
          // }
          if (tooltipY < svgRect.top) {
            tooltipY = svgRect.top + 10;
          }
          if (tooltipY + tooltipHeight > svgRect.bottom) {
            tooltipY = svgRect.bottom - tooltipHeight - 10;
          }
          tooltip.attr('transform', `translate(${tooltipX}, ${tooltipY})`);

          // tooltip.attr('transform', `translate(${event.pageX + 17}, ${event.pageY - 78})`);
        })
        .on('mouseout', (event, d) => {
          d3.select(event.currentTarget).attr('r', 6);
          // console.log('tooltip-out', d)

          const tooltip = d3.select('.tooltip');
          tooltip.transition()
            .delay(50)
            .duration(300)
            .style('opacity', 0);
        });
    });
  }, [colorObjects, data, xScale, yScale, opacity]);

  return (
    <>
      <g opacity={opacity} ref={svgRef} transform={transform} ></g>
      {/* <div className="tooltip" style={{ opacity: 1, backgroundColor: 'black', border: '1px solid black', padding: '8px', borderRadius: '4px' }}></div> */}
    </>
  );
}

export default EmotionCircles;