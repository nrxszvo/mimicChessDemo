import * as d3 from 'd3';

export const createMeter = (elo, group) => {
	let svg;

	const margin = { top: 30, right: 50, bottom: 30, left: 80 },
		width = 180 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	const x = d3.scaleBand().range([0, width]).domain([]).padding(0.2);
	const y = d3.scaleLinear().domain([500, 3000]).range([height, 0]);

	const errorBar = (d) => {
		let ci = d.s ** 0.5 * 2; // 2nd stddev
		return (context, size) => {
			return {
				draw(context, size) {
					const lci = y(d.m - ci) - y(d.m);
					const uci = y(d.m + ci) - y(d.m);

					context.moveTo(0, uci);
					context.lineTo(0, lci);
					context.moveTo(-size / 2, lci);
					context.lineTo(size / 2, lci);
					context.moveTo(-size / 2, uci);
					context.lineTo(size / 2, uci);
				}
			};
		};
	};
	const update = (params, group) => {
		let { m, s } = params;
		let data = [{ group, m, s }];
		svg.selectAll('rect')
			.data(data)
			.join('rect')
			.transition()
			.duration(1000)
			.attr('x', (d) => x(d.group))
			.attr('y', (d) => y(d.m))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d.m))
			.attr('fill', '#00c951');
		svg.selectAll('path.error-bar')
			.data(data)
			.join('path')
			.classed('error-bar', true)
			.transition()
			.duration(1000)
			.attr('transform', (d) => `translate(${x.bandwidth() / 2},${y(d.m)})`)
			.attr('stroke', '#2b7fff')
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.attr('d', (d) => d3.symbol(errorBar(d)).size(10)());
	};

	const init = () => {
		svg = d3
			.select('#' + elo)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.attr('class', 'mx-auto')
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);
		svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
		svg.append('g').attr('class', 'myYaxis').call(d3.axisLeft(y));
	};

	init();

	return {
		update
	};
};
