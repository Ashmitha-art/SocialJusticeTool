import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const SliderComponent = ({ value, onChange }) => {
    const sliderRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(sliderRef.current);

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, 300]).clamp(true);
        const initialValue = value || 0;

        const drag = d3
            .drag()
            .on('drag', (event) => { // use event argument to access d3.event
                const xPos = event.x;
                const value = xScale.invert(xPos);
                // onChange(value);
            });

        const track = svg
            .append('line')
            .attr('class', 'slider-track')
            .attr('x1', xScale.range()[0])
            .attr('x2', xScale.range()[1])
            .attr('y1', 0)
            .attr('y2', 0);

        const handle = svg
            .append('circle')
            .attr('class', 'slider-handle')
            .attr('r', 8)
            .attr('cx', xScale(initialValue))
            .attr('cy', 0)
            .call(drag);

        if (value) {
            handle.attr('cx', xScale(value));
        }
    }, [value, onChange]);

    return (
        <svg width={400} height={100}>
            <g transform="translate(50, 50)">
                <g ref={sliderRef} className="slider" />
            </g>
        </svg>
    );
};

export default SliderComponent;