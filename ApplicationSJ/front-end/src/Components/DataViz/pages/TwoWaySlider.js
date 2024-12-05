import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const TwoWaySlider = (props) => {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;

    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const xScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([0, width])
            .clamp(true);

        const xAxis = d3.axisBottom(xScale);
        const sliderGroup = svg.append('g');
        sliderGroup.append('g').attr('class', 'x axis').call(xAxis);

        const handleColors = ['#6495ED', '#FF7F50'];

        // const handleDrag = (event, i) => {
        //     const x = xScale.invert(event.x);
        //     const otherHandleValue = i === 0 ? xScale.invert(d3.select(svgRef.current).selectAll('.handle').nodes()[1].getAttribute('cx')) : xScale.invert(d3.select(svgRef.current).selectAll('.handle').nodes()[0].getAttribute('cx'));

        //     if (i === 0 && x > (otherHandleValue - 0.1)) return;
        //     if (i === 1 && x < (otherHandleValue + 0.1)) return;

        //     d3.select(event.sourceEvent.target).attr('cx', xScale(x));

        //     props.onSliderChange(i, x);
        // };

        const handleDragEnd = (event, i) => {
            const x = xScale.invert(event.x);
            props.onSliderEnd(i, x);
        };

        // const handle = sliderGroup
        //     .selectAll('.handle')
        //     .data([0, 1])
        //     .join('circle')
        //     .attr('class', 'handle')
        //     .attr('r', 10)
        //     .attr('cx', d => xScale(d))
        //     .attr('cy', height / 1.3)
        //     .style('fill', (d, i) => handleColors[i])
        //     .attr('data-handle-index', (d, i) => i) // Add a custom attribute to store the index
        //     .call(
        //         d3
        //             .drag()
        //             .on('drag', function (event) { // Use 'function' instead of arrow function
        //                 const i = parseInt(this.getAttribute('data-handle-index')); // Retrieve the index using 'this'
        //                 handleDrag(event, i);
        //             })
        //             .on('end', function (event) { // Use 'function' instead of arrow function
        //                 const i = parseInt(this.getAttribute('data-handle-index')); // Retrieve the index using 'this'
        //                 handleDragEnd(event, i);
        //             })
        //     );
        const handleDrag = (event, i) => {
            const x = xScale.invert(event.x);
            const otherHandleValue = i === 0
                ? xScale.invert(d3.select(svgRef.current).selectAll('.handle').nodes()[1].getAttribute('transform').split(',')[0].slice(10))
                : xScale.invert(d3.select(svgRef.current).selectAll('.handle').nodes()[0].getAttribute('transform').split(',')[0].slice(10));

            if (i === 0 && x > (otherHandleValue - 0.1)) return;
            if (i === 1 && x < (otherHandleValue + 0.1)) return;

            d3.select(event.sourceEvent.target.parentNode).attr('transform', `translate(${xScale(x)}, ${height / 1.3})`); // Update the 'transform' attribute of the 'g' element
        };

        const handle = sliderGroup
            .selectAll('.handle')
            .data([0, 1])
            .join('g') // Replace 'path' with 'g'
            .attr('class', 'handle')
            .attr('transform', d => `translate(${xScale(d)}, ${height / 1.3})`) // Use 'transform' to position the triangles
            .attr('data-handle-index', (d, i) => i)
            .call(
                d3
                    .drag()
                    .on('drag', function (event) {
                        const i = parseInt(this.getAttribute('data-handle-index'));
                        handleDrag(event, i);
                    })
                    .on('end', function (event) {
                        const i = parseInt(this.getAttribute('data-handle-index'));
                        handleDragEnd(event, i);
                    })
            );

        handle.append('path') // Add the 'path' element as a child of the 'g' element
            .attr('d', d3.symbol().type(d3.symbolTriangle).size(200))
            .style('fill', (d, i) => handleColors[i]);

    }, []);
    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const svg = d3.select(svgRef.current);
        const handles = svg.selectAll('.handle');

        const xScale = d3
            .scaleLinear()
            .domain([0, 1])
            .range([0, width])
            .clamp(true);

        handles.each(function (d) {
            d3.select(this).attr('cx', xScale(d));
        });
    }, [props.width, props.height]);
    return (
        <g
            ref={svgRef}
            width={props.width}
            height={props.height}
            style={{ backgroundColor: 'white', overflow: 'visible' }}
            transform={props.transform}
        ></g>
    );
};

export default TwoWaySlider;