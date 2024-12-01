import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const RangeSlider = ({ min, max, value, onChange, transform }) => {
    const svgRef = useRef(null);
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 300;
    const height = 50;
    const sliderWidth = 200;
    const sliderHeight = height - margin.top - margin.bottom;
    const tickValues = d3.range(0, 1.1, 0.1);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // Set up the x scale
        const xScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([0, width])
            .clamp(true);

        // Set up the slider
        const slider = svg
            .append('g')
            .attr('class', 'slider')

        slider
            .append('line')
            .attr('class', 'track')
            .attr('x1', xScale.range()[0])
            .attr('x2', xScale.range()[1]);

        slider
            .append('line')
            .attr('class', 'track-inset')
            .attr('x1', xScale.range()[0])
            .attr('x2', xScale.range()[1]);

        const handle = slider
            .insert('circle', '.track-overlay')
            .attr('class', 'handle')
            .attr('r', 9);

        const trackOverlay = slider
            .append('rect')
            .attr('class', 'track-overlay')
            .attr('x', xScale.range()[0])
            .attr('y', -sliderHeight / 2)
            .attr('width', sliderWidth)
            .attr('height', sliderHeight + margin.top);

        // Add ticks to the slider
        slider
            .insert('g', '.track-overlay')
            .attr('class', 'ticks')
            .attr('transform', `translate(0, ${-sliderHeight / 4})`)
            .selectAll('text')
            .data(tickValues)
            .join('text')
            .attr('x', xScale)
            .attr('y', 10)
            .text(d => d.toFixed(1));

        // Update the slider position on mount and on value change
        // const updateSliderPosition = () => {
        //     handle.attr('cx', xScale(value));
        // };

        // updateSliderPosition();

        trackOverlay.call(
            d3
                .drag()
                // .on('start.interrupt', () => slider.interrupt())
                .on('start drag', (event) => {
                    //   const [x] = d3.pointer(event);
                    const x = event.x;
                    const newValue = xScale.invert(x);
                    onChange(newValue);
                    //   updateSliderPosition();
                })
        );
    }, [value, onChange]);

    return <g ref={svgRef} transform={transform} ></g>
};

export default RangeSlider;