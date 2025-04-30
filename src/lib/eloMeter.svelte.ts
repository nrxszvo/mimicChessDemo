import * as d3 from 'd3';

const minElo = 500;
const maxElo = 3000;
export const defParams = { m: minElo, s: 0 };

const margin = { top: 0.075, right: 0.28, bottom: 0.075, left: 0.45 };
const getwh = (w, h) => {
	let width = w * (1 - margin.left - margin.right),
		height = h * (1 - margin.top - margin.bottom),
		mleft = w * margin.left,
		mright = w * margin.right,
		mtop = h * margin.top,
		mbtm = h * margin.bottom;
	return { width, height, mleft, mright, mtop, mbtm };
};

export const createMeter = (elo, group, w_init, h_init) => {
	let svg;
	let w = w_init;
	let h = h_init;

	const errorBar = (d, y) => {
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
	const update = (params, group, wnew, hnew, time) => {
		if (wnew != w || hnew != h) {
			w = wnew;
			h = hnew;
			d3.select('#svg-' + elo).remove();
			init();
		}
		let { width, height, mleft, mright, mtop, mbtm } = getwh(w, h);
		let { m, s } = params;
		const x = d3.scaleBand().range([0, width]).domain([]).padding(0.2);
		const y = d3.scaleLinear().domain([minElo, maxElo]).range([height, 0]);
		const fs = width > 24 ? 10 : 7;
		let data = [{ group, m, s }];
		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.transition()
			.duration(time)
			.attr('x', (d) => x(d.group))
			.attr('y', (d) => y(d.m))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d.m))
			.attr('fill', '#00c951');
		svg
			.select('#xaxis')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x));
		svg.select('#yaxis').attr('font-size', fs).call(d3.axisLeft(y));
		svg
			.selectAll('path.error-bar')
			.data(data)
			.join('path')
			.classed('error-bar', true)
			.transition()
			.duration(time)
			.attr('transform', (d) => `translate(${x.bandwidth() / 2},${y(d.m)})`)
			.attr('stroke', '#2b7fff')
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.attr('d', (d) => d3.symbol(errorBar(d, y)).size(10)());
	};

	const init = () => {
		let { width, height, mleft, mright, mtop, mbtm } = getwh(w, h);
		const x = d3.scaleBand().range([0, width]).domain([]).padding(0.2);
		const y = d3.scaleLinear().domain([minElo, maxElo]).range([height, 0]);
		const wbox = width + mleft + mright;
		const hbox = height + mtop + mbtm;
		const fs = width > 24 ? 10 : 7;
		svg = d3
			.select('#' + elo)
			.append('svg')
			.attr('id', 'svg-' + elo)
			.attr('width', wbox)
			.attr('height', hbox)
			.append('g')
			.attr('transform', `translate(${mleft},${mtop})`);
		svg
			.append('g')
			.attr('id', 'xaxis')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x));
		svg
			.append('g')
			.attr('id', 'yaxis')
			.style('font-size', fs)
			.call(d3.axisLeft(y));

		let { m, s } = defParams;
		let data = [{ group, m, s }];

		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', (d) => x(d.group))
			.attr('y', (d) => y(d.m))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d.m))
			.attr('fill', '#00c951');
		svg
			.selectAll('path.error-bar')
			.data(data)
			.join('path')
			.classed('error-bar', true)
			.attr('transform', (d) => `translate(${x.bandwidth() / 2},${y(d.m)})`)
			.attr('stroke', '#2b7fff')
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.attr('d', (d) => d3.symbol(errorBar(d, y)).size(10)());
	};

	init();

	return {
		update
	};
};
