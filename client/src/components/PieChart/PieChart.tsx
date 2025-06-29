import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getColorScale } from '../../utils/colorScale';
import { shortenCurrency } from '../../utils';

const PieChart = ({
  groupingTypes,
  totalsByGroupingType
}: {
  groupingTypes: string[];
  totalsByGroupingType: Record<string, { count: number; acv: number }>;
}) => {
  // Reduced width and height, and margins
  const width = 440;
  const height = 350;
  const margin = { top: 40, right: 30, bottom: 30, left: 160 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const color = getColorScale(groupingTypes);

  useEffect(() => {
    // Build data array from totalsByGroupingType
    const pieData: { label: string; value: number }[] = groupingTypes.map(type => ({
      label: type,
      value: totalsByGroupingType[type]?.acv || 0
    }));
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

    // Split into left and right side labels
    const leftLabels: {i: number, d: d3.PieArcDatum<{label: string, value: number}>, cy: number}[] = [];
    const rightLabels: {i: number, d: d3.PieArcDatum<{label: string, value: number}>, cy: number}[] = [];
    pieDataReady.forEach((d, i) => {
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      const centroid = outerArc.centroid(d);
      if (midAngle < Math.PI) {
        rightLabels.push({i, d, cy: centroid[1]});
      } else {
        leftLabels.push({i, d, cy: centroid[1]});
      }
    });
    // Sort by centroid y to minimize line crossing
    rightLabels.sort((a, b) => a.cy - b.cy);
    leftLabels.sort((a, b) => a.cy - b.cy);
    // Evenly distribute y positions for each side
    function distributeY(n: number, radius: number) {
      const step = (radius * 1.8) / (n + 1);
      return Array.from({length: n}, (_, k) => -radius * 0.9 + step * (k + 1));
    }
    const rightYs = distributeY(rightLabels.length, radius);
    const leftYs = distributeY(leftLabels.length, radius);
    // Compute label and line positions
    const labelPositions: [number, number][] = Array(pieDataReady.length);
    rightLabels.forEach((item, idx) => {
      labelPositions[item.i] = [radius * 0.99, rightYs[idx]];
    });
    leftLabels.forEach((item, idx) => {
      labelPositions[item.i] = [-radius * 0.99, leftYs[idx]];
    });

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

    // Draw leader lines
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
        const posC = [labelPositions[i][0], labelPositions[i][1]];
        return [posA, posB, posC].map((p) => p.join(",")).join(" ");
      });

    // Draw labels
    svg
      .selectAll('text')
      .data(pieDataReady)
      .enter()
      .append('text')
      .attr('transform', (d, i) => `translate(${labelPositions[i]})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d, i) => labelPositions[i][0] > 0 ? 'start' : 'end')
      .text((d) => {
        const total = d3.sum(pieDataReady, d => d.data.value);
        const percent = total ? ((d.data.value / total) * 100).toFixed(1) : 0;
        return `${shortenCurrency(d.data.value)} (${percent}%)`;
      })
      .style('fill', '#000')
      .style('font-size', '12px');

    // Add total at the center
    const total = pieData.reduce((sum, d) => sum + d.value, 0);
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(`Total: ${shortenCurrency(total)}`)
      .style('font-size', '16px')
      .style('fill', '#000');

  }, [width, height, groupingTypes, totalsByGroupingType]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default PieChart;