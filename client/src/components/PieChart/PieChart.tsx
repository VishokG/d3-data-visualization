import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DataComponentProps } from '../../App';

const PieChart = ({
  quarters,
  groupingTypes,
  dataByGroupingType
}: DataComponentProps) => {
  const width = 650;
  const height = 650;

  // Add margin
  const equalMarginLength = 200;
  const margin = { top: 0, right: equalMarginLength, bottom: equalMarginLength, left: equalMarginLength };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Build data array from props (sum values for the latest quarter)
    let pieData: { label: string; value: number }[] = [];
    if (quarters.length && groupingTypes.length) {
      const latestQuarter = quarters[quarters.length - 1];
      pieData = groupingTypes.map(type => {
        const arr = dataByGroupingType[type] as { quarter: string; acv: number }[];
        const found = arr?.find(obj => obj.quarter === latestQuarter);
        return { label: type, value: found ? found.acv : 0 };
      });
    }
    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up SVG
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const innerRadius = radius * 0.6; // Increased hollow center size
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left + innerWidth / 2}, ${margin.top + innerHeight / 2})`);

    // Create pie generator
    const pie = d3
      .pie<{ label: string; value: number }>()
      .value((d) => d.value)
      .sort(null);

    // Create arc generator for pie slices
    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);

    // Create arc generator for label positions
    const outerArc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number }>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Generate pie chart data
    const pieDataReady = pie(pieData);

    // Color scale
    const color = d3
      .scaleOrdinal<string>()
      .domain(pieData.map((d) => d.label))
      .range(d3.schemeCategory10);

    // Draw pie slices
    svg
      .selectAll('path')
      .data(pieDataReady)
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d) => color(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    // Identify top and bottom sectors
    const topSectors = pieDataReady
      .map((d, i) => ({ i, midAngle: d.startAngle + (d.endAngle - d.startAngle) / 2 }))
      .filter(({ midAngle }) => midAngle < Math.PI / 2 || midAngle > 3 * Math.PI / 2)
      .map(({ i }) => i);
    const bottomSectors = pieDataReady
      .map((d, i) => ({ i, midAngle: d.startAngle + (d.endAngle - d.startAngle) / 2 }))
      .filter(({ midAngle }) => midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2)
      .map(({ i }) => i);

    // Add leader lines
    svg
      .selectAll('polyline')
      .data(pieDataReady)
      .enter()
      .append('polyline')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('points', (d, i) => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        let offset = 0;
        const topIdx = topSectors.indexOf(i);
        const bottomIdx = bottomSectors.indexOf(i);
        if (topIdx !== -1) {
          const spread = 28;
          offset = (topIdx - (topSectors.length - 1) / 2) * spread;
        } else if (bottomIdx !== -1) {
          const spread = 28;
          offset = (bottomIdx - (bottomSectors.length - 1) / 2) * spread;
        } else if (midAngle < 2 * Math.PI / 3 || midAngle > 4 * Math.PI / 3) {
          offset = (i % 2 === 0 ? 1 : -1) * 10;
        }
        posB[1] += offset;
        posC[1] += offset;
        posC[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
        return [posA, posB, posC].map((p) => p.join(",")).join(" ");
      });

    // Add labels with values
    svg
      .selectAll('text')
      .data(pieDataReady)
      .enter()
      .append('text')
      .attr('transform', (d, i) => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        let offset = 0;
        const topIdx = topSectors.indexOf(i);
        const bottomIdx = bottomSectors.indexOf(i);
        if (topIdx !== -1) {
          const spread = 28;
          offset = (topIdx - (topSectors.length - 1) / 2) * spread;
        } else if (bottomIdx !== -1) {
          const spread = 28;
          offset = (bottomIdx - (bottomSectors.length - 1) / 2) * spread;
        } else if (midAngle < 2 * Math.PI / 3 || midAngle > 4 * Math.PI / 3) {
          offset = (i % 2 === 0 ? 1 : -1) * 10;
        }
        pos[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
        pos[1] += offset;
        return `translate(${pos})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .text((d) => `${d.data.label}: ${d.data.value}`)
      .style('fill', '#000')
      .style('font-size', '12px');

    // Add total at the center
    const total = pieData.reduce((sum, d) => sum + d.value, 0);
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(`Total: $${(total / 1000).toFixed(3)}K`)
      .style('font-size', '16px')
      .style('fill', '#000');

  }, [width, height, quarters, groupingTypes, dataByGroupingType]);

  return <svg ref={svgRef}></svg>;
};

export default PieChart;