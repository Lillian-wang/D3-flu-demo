class GenderRatioPie {
  constructor(rootEl, fluDataService, size, colorConfig) {
    this.fluDataService = fluDataService;
    this.tooltipEl = rootEl.append('div').attr('class', 'tooltip');
    this.size = size;
    this.svg = rootEl.append('svg');
    this.gContainer = this.svg.attr('width', size)
      .attr('height', size)
      .append('g');
    this.pie = d3.pie().value(d => {
      const { genderCount, totalCount } = d;
      return Number.parseFloat(genderCount / totalCount).toFixed(4)
    });
    this._current = null;
    this.drawPie(colorConfig);
    this.drawLegend(colorConfig);
  }

  drawLegend(colorConfig) {
    const legendRectSize = 18;
    const legendSpacing = 4;

    // Create boxes.
    const legend = this.svg.selectAll('.legend').data([
      { title: 'Female', color: colorConfig.f, gender: 'f' },
      { title: 'Male', color: colorConfig.m, gender: 'm' }])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => {
        var height = legendRectSize + legendSpacing;
        var offset = 1;
        var vert = 80 + i * height - offset;
        return `translate(65, ${vert})`;
      });

    // Fill boxes.
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', (d) => { return d.color; })
      .style('stroke', 'black');

    // Add title.
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(d => d.title);

    // Attach listeners.
    legend.on('click', d => {
      this.applyFilter(d.gender)
    });
  }

  drawPie(colorConfig) {
    const arcs = this.pie(['f', 'm']);
    const halfSize = this.size / 2;
    this.gContainer
      .attr('transform', `translate(${halfSize}, ${halfSize})`);

    this.path = d3.arc().innerRadius(50).outerRadius(this.size / 2 - 1);
    this.gContainer.selectAll('path').data(arcs)
      .enter().append('path')
      .attr('fill', d => colorConfig[d.data])
      .attr('d', this.path)
      .each(d => { this._current = d; })
      .on('mouseover', this.mouseOver.bind(this))
      .on('mouseout', this.mouseOut.bind(this))
      .on('click', d => {
        this.applyFilter(d.data.gender);
      });
  }

  update(genderInfo) {
    const arcTween = (a) => {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return (t) => { return this.path(i(t)); };
    }
    this.gContainer.selectAll('path')
      .data(this.pie(genderInfo))
      .transition().duration(750).attrTween('d', arcTween);
  }

  applyFilter(selectedGender) {
    this.fluDataService.applyFilter({
      gender: selectedGender
    });
  }

  mouseOver(d) {
    this.tooltipEl.transition().attr('class', 'tooltip show');
    this.tooltipEl.html(() => {
      const gender = d.data.gender === 'f' ? 'Female' : 'Male';
      return `<strong>${gender}</strong>: <span>${d.data.genderCount}</span>`
    })
      .style('left', (d3.event.pageX) + 'px')
      .style('top', (d3.event.pageY - 28) + 'px');
  }

  mouseOut() {
    this.tooltipEl.transition().attr('class', 'tooltip');
  }
}


