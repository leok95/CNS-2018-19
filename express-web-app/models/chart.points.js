const mongoose = require('mongoose');

const ChartPointsSchema = mongoose.Schema({
	_id: { type: String, required: true, unique: true },
	temp: Array,
	hum: Array
});

module.exports = mongoose.model('ChartPoints', ChartPointsSchema);