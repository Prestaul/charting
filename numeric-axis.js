function NumericAxis(dataset, destStart, destEnd, invert) {
	this.invert = !!invert;

	this.artificialMin = null;
	this.artificialMax = null;
	this.keepZeroVisible = false;

	this.targetGridlines = 5;
	this.minGridlines = 2;

	this.autoCalcGridlines = true;
	this.gridMin = 0;
	this.gridMax = 1;

	this.gridlines = [];
	this.plots = [];

	this.setDataset(dataset);
	this.setRange(destStart, destEnd);
}
NumericAxis.prototype = {
	setDataset: function(dataset) {
		this.dataset = dataset;
		this.plots = [];
		return this;
	},

	setRange: function(destStart, destEnd) {
		this.near = destStart^0;
		this.far = destEnd^0;
		this.destStart = this.near;
		this.destSize = this.far - this.near;
		return this;
	},

	setKeepZeroVisible: function(keepZeroVisible) {
		this.keepZeroVisible = keepZeroVisible;
		return this;
	},

	addPlot: function(seriesName) {
		this.plots.push(seriesName);
		return this;
	},

	getValue: function(index, seriesName) {
		return this.dataset.getValue(index, seriesName);
	},

	transform: function(value) {
		if(this.invert) {
			return (this.gridMin - value) * this.destSize / (this.gridMax - this.gridMin) + this.destStart + this.destSize;
		} else {
			return (value - this.gridMin) * this.destSize / (this.gridMax - this.gridMin) + this.destStart;
		}
	},

	transformValue: function(index, seriesName) {
		return this.transform(this.getValue(index, seriesName));
	},

	calculateMinValue: function() {
		var dataset = this.dataset;
		return Math.min.apply(Math, this.plots.map(function(seriesName) {
			return dataset.getMin(seriesName);
		}));
	},
	calculateMaxValue: function() {
		var dataset = this.dataset;
		return Math.max.apply(Math, this.plots.map(function(seriesName) {
			return dataset.getMax(seriesName);
		}));
	},

	reset: function() {
		var minValue = this.calculateMinValue(),
			maxValue = this.calculateMaxValue();

		if(typeof this.artificialMin === 'number') minValue = this.artificialMin;
		if(typeof this.artificialMax === 'number') maxValue = this.artificialMax;

		if(this.keepZeroVisible) {
			if(minValue > 0) {
				minValue = 0;
			} else if(maxValue < 0) {
				maxValue = 0;
			}
		}

		this.minValue = this.gridMin = minValue;
		this.maxValue = this.gridMax = maxValue;
		this.gridlines = [];

		if(this.autoCalcGridlines) {
			this.resetGridlines();
		}

		return this;
	},

	/**
	 * Calculate values for gridlines
	 */
	resetGridlines: function() {
		var minValue = this.minValue,
			maxValue = this.maxValue;

		// if(maxValue == minValue) {
		// 	//Fudge it a little bit
		// 	minValue = 0;
		// 	maxValue = 10;
		// }

		if(!(maxValue - minValue)) { // jshint ignore:line
			var adjust = Math.abs((maxValue && maxValue / 10) || 0.1);
			maxValue += adjust;
			minValue -= adjust;
		}

		var interval = (maxValue - minValue) / (this.targetGridlines + 1);
		var magnitude = Math.log(interval) / Math.log(10);

		interval = Math.pow(10, Math.floor(magnitude));

		var intervals = [
			interval,
			(interval == 0.01 ? 0.02 : 2.5 * interval), // 2 cent intervals instead of 2.5 cents
			5 * interval,
			10 * interval
		];

		var lineCnt = 0, diff = 0, bestDiff = null, bestInterval = null;
		for(var i = 0; i < intervals.length; i++) {
			interval = intervals[i];

			lineCnt = Math.ceil(maxValue / interval) - Math.floor(minValue / interval) - 1;
			diff = Math.round(Math.abs(this.targetGridlines - lineCnt));

			if(lineCnt >= this.minGridlines && (bestDiff === null || diff <= bestDiff)) {
				bestDiff = diff;
				bestInterval = interval;
			}
		}

		if(!bestInterval) bestInterval = intervals[0];

		this.gridMin = Math.floor(minValue / bestInterval) * bestInterval;
		this.gridMax = Math.ceil(maxValue / bestInterval) * bestInterval;

		this.gridlines = [];
		for(var line = this.gridMin + bestInterval; line < this.gridMax; line += bestInterval)
			this.gridlines.push(line);
	}
};

NumericAxis.prototype.t = NumericAxis.prototype.transform;
NumericAxis.prototype.tv = NumericAxis.prototype.transformValue;

module.exports = NumericAxis;
