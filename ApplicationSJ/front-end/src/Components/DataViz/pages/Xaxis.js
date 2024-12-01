import React from "react";
import * as d3 from "d3";

const Xaxis = ({
    scale,
    tickSize,
    transform,
}) => {
    const ref = React.useRef(null);
    React.useEffect(() => {
        const axisGenerator = d3.axisBottom;
        const axis = axisGenerator(scale).tickSize(tickSize);
        const xAxisGroup = d3.select(ref.current);
        xAxisGroup.call(axis);
        xAxisGroup
            .selectAll("line").attr("stroke", "rgba(0, 0, 0, 0.2)");
        xAxisGroup.selectAll("text")
            .attr("opacity", 0.9)
            .attr("color", "black")
            .attr("font-size", "0.75rem");

    }, [scale, tickSize]);
    return <g ref={ref} transform={transform} />;
};

export default Xaxis;