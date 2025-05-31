/**
 * Analytics Visualization Components
 * Track 3: Learning Analytics & Insights
 * 
 * Provides chart and visualization components for analytics dashboard
 */

class AnalyticsVisualizations {
    constructor() {
        this.charts = new Map();
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#4caf50',
            warning: '#ff9800',
            danger: '#f44336',
            info: '#2196f3'
        };
    }

    /**
     * Create a line chart for time-series data
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth;
        const height = options.height || 150;
        const padding = { top: 20, right: 20, bottom: 30, left: 40 };

        // Create SVG
        const svg = this.createSVG(container, width, height);
        
        // Create scales
        const xScale = this.createTimeScale(data, width - padding.left - padding.right);
        const yScale = this.createLinearScale(data, height - padding.top - padding.bottom);

        // Create chart group
        const chart = svg.append('g')
            .attr('transform', `translate(${padding.left},${padding.top})`);

        // Add gradient
        const gradient = this.createGradient(svg, 'line-gradient', this.colors.primary, this.colors.secondary);

        // Draw line
        const line = d3.line()
            .x(d => xScale(new Date(d.date || d.x)))
            .y(d => yScale(d.value || d.y))
            .curve(d3.curveMonotoneX);

        chart.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'url(#line-gradient)')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Add area under line
        const area = d3.area()
            .x(d => xScale(new Date(d.date || d.x)))
            .y0(height - padding.top - padding.bottom)
            .y1(d => yScale(d.value || d.y))
            .curve(d3.curveMonotoneX);

        chart.append('path')
            .datum(data)
            .attr('fill', 'url(#line-gradient)')
            .attr('opacity', 0.1)
            .attr('d', area);

        // Add dots
        chart.selectAll('.dot')
            .data(data)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(new Date(d.date || d.x)))
            .attr('cy', d => yScale(d.value || d.y))
            .attr('r', 4)
            .attr('fill', this.colors.primary)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Add axes
        this.addAxes(chart, xScale, yScale, width - padding.left - padding.right, height - padding.top - padding.bottom);

        // Store chart reference
        this.charts.set(containerId, { svg, chart, xScale, yScale, data });

        return this;
    }

    /**
     * Create a bar chart for categorical data
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth;
        const height = options.height || 200;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };

        // Create SVG
        const svg = this.createSVG(container, width, height);

        // Create scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.label || d.x))
            .range([0, width - padding.left - padding.right])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value || d.y)])
            .nice()
            .range([height - padding.top - padding.bottom, 0]);

        // Create chart group
        const chart = svg.append('g')
            .attr('transform', `translate(${padding.left},${padding.top})`);

        // Create gradient
        const gradient = this.createGradient(svg, 'bar-gradient', this.colors.primary, this.colors.secondary);

        // Draw bars
        chart.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.label || d.x))
            .attr('y', d => yScale(d.value || d.y))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - padding.top - padding.bottom - yScale(d.value || d.y))
            .attr('fill', 'url(#bar-gradient)')
            .attr('rx', 4)
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip());

        // Add value labels
        chart.selectAll('.label')
            .data(data)
            .enter().append('text')
            .attr('class', 'label')
            .attr('x', d => xScale(d.label || d.x) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value || d.y) - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#666')
            .text(d => d.value || d.y);

        // Add axes
        this.addAxes(chart, xScale, yScale, width - padding.left - padding.right, height - padding.top - padding.bottom, 'band');

        // Store chart reference
        this.charts.set(containerId, { svg, chart, xScale, yScale, data });

        return this;
    }

    /**
     * Create a donut chart for proportional data
     */
    createDonutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth;
        const height = options.height || 200;
        const radius = Math.min(width, height) / 2 - 20;
        const innerRadius = radius * 0.6;

        // Create SVG
        const svg = this.createSVG(container, width, height);

        // Create chart group
        const chart = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Create pie layout
        const pie = d3.pie()
            .value(d => d.value || d.y)
            .sort(null);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        // Create color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label || d.x))
            .range([this.colors.primary, this.colors.secondary, this.colors.success, this.colors.warning, this.colors.info]);

        // Draw arcs
        const arcs = chart.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label || d.data.x))
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .on('mouseover', (event, d) => this.showTooltip(event, d.data))
            .on('mouseout', () => this.hideTooltip());

        // Add center text
        const total = data.reduce((sum, d) => sum + (d.value || d.y), 0);
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .attr('font-size', '24px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(total);

        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .attr('font-size', '14px')
            .attr('fill', '#666')
            .text('Total');

        // Store chart reference
        this.charts.set(containerId, { svg, chart, pie, arc, color, data });

        return this;
    }

    /**
     * Create a progress gauge
     */
    createGauge(containerId, value, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth;
        const height = options.height || 120;
        const radius = Math.min(width, height) / 2 - 10;

        // Create SVG
        const svg = this.createSVG(container, width, height);

        // Create chart group
        const chart = svg.append('g')
            .attr('transform', `translate(${width / 2},${height - 10})`);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2);

        // Background arc
        chart.append('path')
            .attr('d', arc)
            .attr('fill', '#e0e0e0');

        // Value arc
        const valueArc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius)
            .startAngle(-Math.PI / 2)
            .endAngle(-Math.PI / 2 + (Math.PI * value / 100));

        const gradient = this.createGradient(svg, 'gauge-gradient', this.colors.success, this.colors.primary);

        chart.append('path')
            .attr('d', valueArc)
            .attr('fill', 'url(#gauge-gradient)');

        // Add value text
        chart.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.5em')
            .attr('font-size', '28px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(`${value}%`);

        // Add label
        if (options.label) {
            chart.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .attr('font-size', '14px')
                .attr('fill', '#666')
                .text(options.label);
        }

        // Store chart reference
        this.charts.set(containerId, { svg, chart, value });

        return this;
    }

    /**
     * Update existing chart with new data
     */
    updateChart(containerId, newData) {
        const chartInfo = this.charts.get(containerId);
        if (!chartInfo) return;

        // Implement update logic based on chart type
        // This would animate the transition to new data
        console.log(`Updating chart ${containerId} with new data`);
    }

    /**
     * Helper methods
     */
    createSVG(container, width, height) {
        // Clear existing content
        d3.select(container).selectAll('*').remove();

        return d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    createTimeScale(data, width) {
        return d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date || d.x)))
            .range([0, width]);
    }

    createLinearScale(data, height) {
        return d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value || d.y)])
            .nice()
            .range([height, 0]);
    }

    createGradient(svg, id, startColor, endColor) {
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', id)
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', startColor);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', endColor);

        return gradient;
    }

    addAxes(chart, xScale, yScale, width, height, xScaleType = 'time') {
        // X axis
        const xAxis = xScaleType === 'time' 
            ? d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d'))
            : d3.axisBottom(xScale);

        chart.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .attr('font-size', '12px');

        // Y axis
        chart.append('g')
            .call(d3.axisLeft(yScale).ticks(5))
            .attr('font-size', '12px');
    }

    showTooltip(event, data) {
        // Create tooltip if it doesn't exist
        let tooltip = d3.select('body').select('.chart-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'chart-tooltip')
                .style('position', 'absolute')
                .style('padding', '10px')
                .style('background', 'rgba(0, 0, 0, 0.8)')
                .style('color', 'white')
                .style('border-radius', '5px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('opacity', 0);
        }

        // Update tooltip content
        tooltip.html(`
            <strong>${data.label || data.x || ''}</strong><br>
            Value: ${data.value || data.y || 0}
        `);

        // Show tooltip
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);

        // Position tooltip
        tooltip.style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    hideTooltip() {
        d3.select('.chart-tooltip')
            .transition()
            .duration(200)
            .style('opacity', 0);
    }
}

// Initialize visualizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsViz = new AnalyticsVisualizations();
    console.log('Analytics Visualizations initialized');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsVisualizations;
}