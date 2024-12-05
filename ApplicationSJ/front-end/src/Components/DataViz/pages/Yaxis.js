import React from "react";
import * as d3 from "d3";
import "./Yaxis.css";

const Yaxis = ({ scale, transform, handleTickClick }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const axisGenerator = d3.axisLeft;
    const axis = axisGenerator(scale);

    const yAxisGroup = d3.select(ref.current);
    yAxisGroup.call(axis);

    yAxisGroup.selectAll("line").attr("stroke", "rgba(0, 0, 0, 0.2)");

    // Store the text selection in a variable for reuse
    const ticks = yAxisGroup
      .selectAll("text")
      .attr("opacity", 0.9)
      .attr("color", "black")
      .attr("font-size", "0.75rem")
      .attr("class", "y-axis-tick");

    // Add optional event listeners if needed
    ticks.on("click", function (event, d) {
      handleTickClick(d)
    });
  }, [scale]);

  return <g ref={ref} transform={transform} />;
};

export default Yaxis;