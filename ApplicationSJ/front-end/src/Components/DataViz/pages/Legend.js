import React from "react";
import * as d3 from "d3";

const ColorLegend = ({
  colorScale,
  onHover,
  hoveredValue,
  fadeOpacity,
  transform,
  handleTooltip,
}) => {
  const svgRef = React.useRef(null);
  const getOpacity = (emotion) => {
    return hoveredValue && emotion !== hoveredValue.emotion ? fadeOpacity : 1;
  };
  React.useEffect(() => {
    const ref = d3.select(svgRef.current);
    ref.selectAll("*").remove()

    colorScale.forEach((object, index) => {
      const legendG = ref.append('g')
        .attr('transform', `translate(0, ${index * 25})`);
      legendG.append('circle')
        .attr('class', object.emotion)
        .attr('r', 10)
        .attr('cx', 10)
        .attr('cy', 12)
        .style('fill', object.color)
        .style('opacity', getOpacity(object.emotion))
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('pointer-events', 'all')
        .style('stroke-opacity', 0.5)
        .style('stroke-opacity', 0.5)
        .on("mouseenter", () => {
          // handleTooltip();
          onHover(object);
        })
        .on("mouseout", ()=>{
          // handleTooltip();
          onHover(null)
        }) 

      legendG.append('text')
        .attr('class', object.emotion)
        .text(object.emotion)
        .attr('x', 30)
        .attr('y', 12)
        .style('font-size', 14)
        .attr('alignment-baseline', 'middle')
        .style('opacity', getOpacity(object.emotion));

        // legendG.selectAll(`${object.emotion}`).style('opacity',getOpacity(object.emotion))
        // console.log(legendG.selectAll('circle').style('opacity'))

    });
  }, [colorScale, hoveredValue, fadeOpacity, onHover]);

  return (
    <g ref={svgRef} transform={transform}>
    </g>)
}

export default ColorLegend;