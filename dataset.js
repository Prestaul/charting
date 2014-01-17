function Dataset(data, firstIndex, length) {
	this.setData(data, firstIndex, length);
}

Dataset.prototype = {
	setData: function(data, firstIndex, length) {
		if(!(data instanceof Array && data.length >= 2))
			throw new Error('Data provided to a Dataset must be of type Array and have a length of at least two.');

		this.data = data;
		this.firstIndex = 0;
		this.length = this.data.length;
		return this.reset(firstIndex, length);
	},

	reset: function(firstIndex, length) {
		if(arguments.length >= 1) {
			this.firstIndex = Math.min(Math.max(0, firstIndex^0), this.data.length - 2);
		}

		length = length^0 || this.length;
		this.length = Math.min(Math.max(2, length), this.data.length - this.firstIndex);

		this._cache = {};
		return this;
	},

	cache: function(key, getter, args) {
		return this._cache[key] || (this._cache[key] = getter.apply(this, args || []));
	},

	getValue: function(index, seriesName) {
		return this.getSeries(seriesName)[index - this.firstIndex];
	},

	getLastIndex: function() {
		return this.firstIndex + this.length - 1;
	},

	getSeries: function(seriesName) {
		return this.cache(seriesName, function() {
			return this.data
				.slice(this.firstIndex, this.firstIndex + this.length)
				.map(function(row) {
					return (seriesName in row) ? row[seriesName] : null;
				});
		});
	},
	getMappedSeries: function(seriesName, key, mapper) {
		return this.cache(seriesName + '~' + key, function() {
			return this.getSeries(seriesName).map(mapper);
		});
	},
	getNumericSeries: function(seriesName) {
		return this.getMappedSeries(seriesName, 'numeric', function(value) {
			return parseFloat(value, 10);
		});
	},
	getIntegerSeries: function(seriesName) {
		return this.getMappedSeries(seriesName, 'integers', function(value) {
			return value.getTime ? value.getTime() : value ^ 0;
		});
	},

	getMin: function(seriesName) {
		return this.cache(seriesName + '~min', function() {
			var min = Number.MAX_VALUE,
				series = this.getNumericSeries(seriesName),
				i = series.length;

			while(i--) if(series[i] < min && !(isNaN || Number.isNaN)(series[i])) min = series[i];

			return (min === Number.MAX_VALUE) ? 0 : min;
		});
	},
	getMax: function(seriesName) {
		return this.cache(seriesName + '~max', function() {
			var max = Number.MIN_VALUE,
				series = this.getNumericSeries(seriesName),
				i = series.length;

			while(i--) if(series[i] > max && !(isNaN || Number.isNaN)(series[i])) max = series[i];

			return (max === Number.MIN_VALUE) ? 0 : max;
		});
	},
	generateLoserSeries: function(seriesName) {
		this.getMappedSeries(seriesName, 'losers', function(value) {
			return -value;
		});
		return this;
	}
};

module.exports = Dataset;
