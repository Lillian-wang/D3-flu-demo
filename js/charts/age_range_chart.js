class AgeRangeChart {
  constructor(rootEl, fluDataService, dimensions) {
    this.rootEl = rootEl;
    this.fluDataService = fluDataService;
    const [top, right, bottom, left] = dimensions;
    this.width = 500 - left - right;
    this.height = 260 - top - bottom;
    this.toolTipEl = rootEl.append('div').attr('class', 'tooltip');
    this.x = d3.scaleBand().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.svg = rootEl.append('svg')
      .attr('width', this.width + left + right)
      .attr('height', this.height + top + bottom)
      .append('g')
      .attr('transform',
        `translate(${left} ,${top - 30})`);
    this.barContainerEl = this.svg.append('g').attr('class', 'bar-container');
    this.xAxisEl = this.svg.append('g').attr('class', 'x-axis');
    this.yAxisEl = this.svg.append('g').attr('class', 'y-axis');
  }

  update(data) {
    this.barContainerEl.selectAll('.bar').data(data).enter().append('rect')
      .attr('class', 'bar')
      .on('mouseover', this.mouseOver.bind(this))
      .on('mouseout', this.mouseOut.bind(this))
      .on('click', this.click.bind(this));

    this.x.domain(data.map(d => d.title));
    this.y.domain([0, d3.max(data, d => d.totalEnabled)]);
    this.barContainerEl.selectAll('.bar').data(data)
      .transition().duration(750)
      .attr('x', d => this.x(d.title) + 10)
      .attr('width', this.x.bandwidth() - 10)
      .attr('y', d => this.y(d.totalEnabled))
      .attr('height', d => this.height - this.y(d.totalEnabled))
      .style('fill', d => {
        if (d.totalEnabled === 0) { return '#ddd'; }
        return d3.interpolate('#5bc5ff', '#0c1b23')(d.totalEnabled / 100);
      })

    this.xAxisEl.attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.x));

    this.yAxisEl.call(d3.axisLeft(this.y));

  }
  click(d) {
    this.fluDataService.applyFilter({
      ageRange: [d.minAge, d.maxAge]
    });
  }

  mouseOver(d) {
    this.toolTipEl.transition().attr('class', 'tooltip show');
    this.toolTipEl.html(() => `<strong>Age ${d.title}: </strong><span>${d.totalEnabled}</span>`
    ).style('left', `${d3.event.pageX}px`).style('top', `${d3.event.pageY - 28}px`);
  }

  mouseOut() {
    this.toolTipEl.transition().attr('class', 'tooltip');
  }
}

class ageRangeEntry {
  constructor(ageRange) {
    const [minAge, maxAge] = ageRange;
    this.minAge = minAge;
    this.maxAge = maxAge;
    this.title = `${minAge} - ${maxAge}`;
    this.totalCount = 0;
    this.totalEnabled = 0;
  }
}