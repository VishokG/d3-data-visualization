import * as d3 from 'd3';

export function getColorScale(domain: string[]) {
  return d3.scaleOrdinal<string>()
    .domain(domain)
    .range([
      '#3584BB', '#FF8C26', '#4CAF50', '#A259FF', '#FF5C8A',
      '#FFD600', '#00B8D9', '#FF5630', '#36B37E', '#B47CFF',
      '#FFAB00', '#FF8B94', '#6A4C93', '#43AA8B', '#F3722C'
    ]);
}
