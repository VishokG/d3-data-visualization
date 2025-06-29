import * as d3 from "d3";
import { useEffect, useRef } from "react";
import type { DataComponentProps } from "../../App";

const BarChart = ({
  quarters,
  groupingTypes,
  dataByGroupingType
}: DataComponentProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!quarters.length || !groupingTypes.length) return;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 650 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Build data array from props (extract acv for each group/quarter)
    const data = quarters.map((quarter) => {
      const entry: Record<string, number | string> = { quarter };
      groupingTypes.forEach((type) => {
        const arr = dataByGroupingType[type] as { quarter: string; acv: number }[];
        const found = arr?.find(obj => obj.quarter === quarter);
        entry[type] = found ? found.acv : 0;
      });
      return entry;
    });

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .selectAll("g")
      .data([null])
      .join("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Prepare data for stacking
    const stackData = data.map(d => {
      const obj: Record<string, number> = {};
      groupingTypes.forEach(type => { obj[type] = Number(d[type]); });
      return obj;
    });
    const stack = d3.stack<Record<string, number>>().keys(groupingTypes);
    const stackedData = stack(stackData);

    const x = d3.scaleBand()
      .domain(data.map(d => d.quarter as string))
      .range([0, width])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1])) || 0])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal<string>()
      .domain(groupingTypes)
      .range([
        "#3584BB", "#FF8C26", "#4CAF50", "#A259FF", "#FF5C8A", // original
        "#FFD600", "#00B8D9", "#FF5630", "#36B37E", "#B47CFF", // new
        "#FFAB00", "#FF8B94", "#6A4C93", "#43AA8B", "#F3722C"   // more
      ]);

    svg.selectAll(".bar").remove();
    svg.selectAll(".y-grid").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll("text").remove();

    // Add y-axis grid lines
    svg.append("g")
      .attr("class", "y-grid")
      .call(
        d3.axisLeft(y)
          .tickValues(
            d3.range(
              Math.ceil(y.domain()[0] / 200000) * 200000,
              y.domain()[1] + 200000,
              200000
            )
          )
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e0e0e0");

    // Add x axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(Math.ceil((y.domain()[0] - y.domain()[1]) / 200000))
        .tickFormat(d3.format(".2s"))
        .tickValues(
          d3.range(
            Math.ceil(y.domain()[0] / 200000) * 200000,
            y.domain()[1] + 200000,
            200000
          )
        )
      )
      .selectAll("text")
      .style("font-size", "12px");

    // Draw bars
    svg.selectAll(".bar")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("fill", d => color(d.key) as string)
      .selectAll("rect")
      .data((d, i) => d.map((entry, j) => ({
        ...entry,
        quarter: data[j].quarter,
        value: entry[1] - entry[0],
        key: stackedData[i].key
      })))
      .enter()
      .append("rect")
      .attr("x", d => {
        const xVal = x(d.quarter as string);
        return (typeof xVal === "number" ? xVal : 0) + x.bandwidth() * 0.2;
      })
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth() * 0.6);

    // Tooltip div (one per chart)
    let tooltip = d3.select<HTMLDivElement, unknown>("#bar-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("id", "bar-tooltip")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("z-index", 1000)
        .style("display", "none");
    }

    // Add value and percentage labels
    svg.selectAll(".bar")
      .data(stackedData)
      .selectAll("g.label-group")
      .data((d, i) => d.map((entry, j) => {
        const value = entry[1] - entry[0];
        const total = groupingTypes.reduce((sum, type) => sum + (Number(data[j][type]) || 0), 0);
        const percent = total > 0 ? (value / total) * 100 : 0;
        const barHeight = y(entry[0]) - y(entry[1]);
        return {
          quarter: data[j].quarter,
          value,
          percent,
          y1: entry[1],
          y0: entry[0],
          key: stackedData[i].key,
          barHeight
        };
      }))
      .enter()
      .append("g")
      .attr("class", "label-group")
      .each(function(d) {
        const xVal = x(d.quarter as string);
        const xPos = (typeof xVal === "number" ? xVal : 0) + x.bandwidth() * 0.5;
        const yCenter = y(d.y1) + (y(d.y0) - y(d.y1)) / 2;
        function formatValue(val: number) {
          if (val >= 1_000) return ("$" + (val / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "K");
          return "$" + val.toLocaleString();
        }
        // Always add invisible rect for tooltip events
        d3.select(this)
          .append("rect")
          .attr("x", xPos - x.bandwidth() * 0.3)
          .attr("y", y(d.y1))
          .attr("width", x.bandwidth() * 0.6)
          .attr("height", d.barHeight)
          .attr("fill", "transparent")
          .on("mousemove", function(event) {
            const barColor = color(d.key);
            tooltip
              .style("display", "block")
              .html(
                `<span style="display:inline-block;width:12px;height:12px;background:${barColor};border-radius:2px;margin-right:6px;vertical-align:middle;"></span>` +
                `<strong>${d.key}</strong><br/>Quarter: ${d.quarter}<br/>Value: ${formatValue(d.value)}<br/>Percent: ${Math.round(d.percent)}%`
              )
              .style("left", (event.pageX + 12) + "px")
              .style("top", (event.pageY - 24) + "px");
          })
          .on("mouseleave", function() {
            tooltip.style("display", "none");
          });
        // Only show text if bar is tall enough
        if (d.barHeight > 18) {
          d3.select(this)
            .append("text")
            .attr("x", xPos)
            .attr("y", yCenter - 2)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "12px")
            .text(formatValue(d.value));
          d3.select(this)
            .append("text")
            .attr("x", xPos)
            .attr("y", yCenter + 13)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "10px")
            .text(`(${Math.round(d.percent)}%)`);
        }
      });

    // Add total value on top of each bar
    data.forEach((d) => {
      const total = groupingTypes.reduce((sum, type) => sum + (Number(d[type]) || 0), 0);
      const xVal = x(d.quarter as string);
      const xPos = (typeof xVal === "number" ? xVal : 0) + x.bandwidth() * 0.5;
      const yPos = y(total) - 8;
      // Only add label if total > 0
      if (total > 0) {
        const formatValue = (val: number) => val >= 1_000 ? ("$" + (val / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "K") : "$" + val.toLocaleString();
        svg.append("text")
          .attr("x", xPos)
          .attr("y", yPos)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .style("font-size", "12px")
          .text(formatValue(total));
      }
    });
  }, [quarters, groupingTypes, dataByGroupingType]);

  return (
    <svg ref={svgRef}></svg>
  );
};
export default BarChart;