function IndexAxis(dataset, destStart, destEnd, invert) {
	this.invert = !!invert;
	this.hasPadding = false;

	this.targetGridlines = 5;
	this.gridlines = [];

	this.setDataset(dataset);
	this.setRange(destStart, destEnd);
}
IndexAxis.prototype = {
	setDataset: function(dataset) {
		this.dataset = dataset;
		return this.reset();
	},

	setRange: function(destStart, destEnd) {
		this.near = destStart^0;
		this.far = destEnd^0;
		this.destStart = this.near;
		this.destSize = this.far - this.near;
		return this;
	},

	addPlot: function() {
		return this;
	},

	setPadding: function(hasPadding) {
		this.hasPadding = !!hasPadding;
		return this;
	},

	getValue: function(index) {
		return index;
	},

	transform: function(index) {
		if(this.invert) {
			return (this.firstIndex - index - (this.hasPadding ? 0.5 : 0)) * this.destSize / (this.length - (this.hasPadding ? 0 : 1)) + this.destStart + this.destSize;
		} else {
			return (index - this.firstIndex + (this.hasPadding ? 0.5 : 0)) * this.destSize / (this.length - (this.hasPadding ? 0 : 1)) + this.destStart;
		}
	},

	transformValue: function(index) {
		return this.transform(index);
	},

	reverse: function(position) {
		return this.firstIndex + Math.round((position - this.near) * (this.length - (this.hasPadding ? 0 : 1)) / this.destSize);
	},

	calculateMinValue: function() {
		return this.firstIndex;
	},
	calculateMaxValue: function() {
		return this.firstIndex + this.length - 1;
	},

	reset: function() {
		this.firstIndex = this.dataset.firstIndex;
		this.length = this.dataset.length;
		this.minValue = this.calculateMinValue();
		this.maxValue = this.calculateMaxValue();
		return this.resetGridlines();
	},

	resetGridlines: function() {
		var segmentCount = this.length - 1,
			interval = Math.floor((segmentCount - 1) / this.targetGridlines) || 1,
			lineCount = Math.round(segmentCount / interval),
			offset = Math.round((segmentCount - (lineCount-1) * interval) / 2);

		this.gridlines = [];

		for(var i = 0; i < lineCount; i++) {
			this.gridlines.push(this.firstIndex + offset + i * interval);
		}

		return this;
	}
};

IndexAxis.prototype.t = IndexAxis.prototype.transform;
IndexAxis.prototype.tv = IndexAxis.prototype.transformValue;

module.exports = IndexAxis;
